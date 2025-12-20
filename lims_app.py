import streamlit as st
import pandas as pd
from datetime import datetime
import uuid

# --- CONFIGURATION & STATE MANAGEMENT ---
st.set_page_config(page_title="cGMP Sample Tracker", layout="wide")

# Initialize Session State (This acts as our temporary database)
if 'samples' not in st.session_state:
    st.session_state.samples = pd.DataFrame(columns=[
        "Sample ID", "Batch Number", "Material", "Stage", 
        "Status", "Location", "Created By", "Created At"
    ])

if 'audit_trail' not in st.session_state:
    st.session_state.audit_trail = pd.DataFrame(columns=[
        "Timestamp", "User", "Action", "Sample ID", "Details"
    ])

# --- HELPER FUNCTIONS ---

def log_audit(user, action, sample_id, details):
    """Logs actions to the Audit Trail (cGMP Requirement)"""
    new_log = {
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "User": user,
        "Action": action,
        "Sample ID": sample_id,
        "Details": details
    }
    st.session_state.audit_trail = pd.concat(
        [st.session_state.audit_trail, pd.DataFrame([new_log])], ignore_index=True
    )

def generate_id():
    """Generates a unique Sample ID"""
    return f"SMP-{datetime.now().strftime('%y%m')}-{str(uuid.uuid4())[:4].upper()}"

# --- SIDEBAR: USER SIMULATION ---
st.sidebar.title("🔐 User Context")
current_user = st.sidebar.text_input("Operator Name / ID", value="J. Doe")
user_role = st.sidebar.radio("Select Department", ["Production", "Sample Management", "QC Lab", "QA (Audit Log)"])

st.sidebar.markdown("---")
st.sidebar.info(f"**Current User:** {current_user}\n\n**Role:** {user_role}")

# --- MAIN APP LOGIC ---

st.title("🧪 cGMP Sample Chain of Custody")

# 1. PRODUCTION VIEW (Sample Generation)
if user_role == "Production":
    st.header("🏭 Production: Sample Submission")
    
    with st.form("sample_submission_form"):
        col1, col2 = st.columns(2)
        batch_num = col1.text_input("Batch Number (e.g., B-2025-001)")
        material = col2.selectbox("Material Type", ["Raw Material", "In-Process", "Bulk Drug Substance", "Finished Product"])
        sampling_point = st.text_input("Sampling Point (e.g., Tank A, Valve 3)")
        
        submit = st.form_submit_button("Generate Sample Label")
        
        if submit and batch_num and material:
            new_id = generate_id()
            new_sample = {
                "Sample ID": new_id,
                "Batch Number": batch_num,
                "Material": material,
                "Stage": "Production",
                "Status": "Pending Transfer",
                "Location": sampling_point,
                "Created By": current_user,
                "Created At": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            st.session_state.samples = pd.concat(
                [st.session_state.samples, pd.DataFrame([new_sample])], ignore_index=True
            )
            
            log_audit(current_user, "Creation", new_id, f"Sample created for Batch {batch_num}")
            st.success(f"Sample {new_id} created and label generated.")

# 2. SAMPLE MANAGEMENT VIEW (Receipt & Storage)
elif user_role == "Sample Management":
    st.header("📦 Sample Management: Receipt & Storage")
    
    # Filter for samples coming from Production
    pending_samples = st.session_state.samples[
        (st.session_state.samples['Status'] == 'Pending Transfer')
    ]
    
    if pending_samples.empty:
        st.info("No incoming samples pending receipt.")
    else:
        st.write("### Incoming Shipments")
        for index, row in pending_samples.iterrows():
            with st.expander(f"Receiving: {row['Sample ID']} (Batch: {row['Batch Number']})"):
                col1, col2 = st.columns(2)
                col1.write(f"**Material:** {row['Material']}")
                col1.write(f"**Origin:** {row['Location']}")
                
                storage_loc = col2.text_input(f"Assign Storage Location for {row['Sample ID']}", placeholder="e.g., Fridge-02, Shelf-B")
                
                if col2.button(f"Confirm Receipt {row['Sample ID']}"):
                    if storage_loc:
                        st.session_state.samples.at[index, 'Status'] = 'Received / In Storage'
                        st.session_state.samples.at[index, 'Stage'] = 'Sample Management'
                        st.session_state.samples.at[index, 'Location'] = storage_loc
                        
                        log_audit(current_user, "Receipt", row['Sample ID'], f"Stored in {storage_loc}")
                        st.rerun()
                    else:
                        st.error("Please assign a storage location.")

# 3. QC LAB VIEW (Testing & Result Entry)
elif user_role == "QC Lab":
    st.header("🔬 QC Lab: Testing & Disposition")
    
    # Filter for samples ready for testing
    lab_samples = st.session_state.samples[
        (st.session_state.samples['Status'] == 'Received / In Storage') | 
        (st.session_state.samples['Status'] == 'In Testing')
    ]
    
    sample_id_to_test = st.selectbox("Select Sample to Test", lab_samples['Sample ID'].unique())
    
    if sample_id_to_test:
        sample_data = lab_samples[lab_samples['Sample ID'] == sample_id_to_test].iloc[0]
        
        st.markdown(f"**Testing Material:** `{sample_data['Material']}` | **Batch:** `{sample_data['Batch Number']}`")
        
        with st.form("test_results"):
            st.subheader("Enter Test Results")
            # Dynamic fields based on pharma requirements
            col1, col2 = st.columns(2)
            ph_val = col1.number_input("pH Value", min_value=0.0, max_value=14.0, step=0.1)
            purity = col2.number_input("Purity / Assay (%)", min_value=0.0, max_value=100.0, step=0.1)
            
            disposition = st.radio("Final Disposition", ["Pass", "Fail", "OOS (Out of Spec)"])
            comments = st.text_area("Analyst Comments")
            
            sign_off = st.checkbox("I certify these results are accurate (Electronic Signature)")
            
            submit_results = st.form_submit_button("Submit Results & Release")
            
            if submit_results:
                if sign_off:
                    # Update Record
                    idx = st.session_state.samples[st.session_state.samples['Sample ID'] == sample_id_to_test].index[0]
                    st.session_state.samples.at[idx, 'Status'] = f"Completed ({disposition})"
                    st.session_state.samples.at[idx, 'Stage'] = "QC Lab"
                    
                    # Log Audit
                    audit_msg = f"pH: {ph_val}, Purity: {purity}%, Disp: {disposition}. Note: {comments}"
                    log_audit(current_user, "Testing", sample_id_to_test, audit_msg)
                    
                    st.success(f"Sample {sample_id_to_test} processed successfully.")
                    st.rerun()
                else:
                    st.error("Electronic signature required.")

# 4. QA / AUDIT VIEW (The cGMP Core)
elif user_role == "QA (Audit Log)":
    st.header("📑 QA Master Audit Trail")
    st.markdown("This log is immutable and tracks all system activity.")
    
    # Show Sample Table
    st.subheader("Current Sample Status")
    st.dataframe(st.session_state.samples)
    
    st.markdown("---")
    
    # Show Audit Log
    st.subheader("Audit Logs")
    # Styling the dataframe to highlight changes
    st.dataframe(
        st.session_state.audit_trail.sort_values(by="Timestamp", ascending=False), 
        use_container_width=True
    )
