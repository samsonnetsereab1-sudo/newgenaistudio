# NewGen Studio Phase 2 MVP — Prioritized Backlog

**Version**: 1.0.0  
**Date**: December 10, 2025  
**Status**: Roadmap Planning

---

## Overview

This document prioritizes the implementation backlog for NewGen Studio's advanced biologics capabilities. Work is organized into **6 Epics** with **18 Stories** across **3 Release Phases**: MVP, Phase 1, and Phase 2 (Enterprise).

### Prioritization Framework
- **MoSCoW Method**: Must-have, Should-have, Could-have, Won't-have (this release)
- **T-Shirt Sizing**: Small (1-3 days), Medium (1-2 weeks), Large (2-4 weeks), XL (4+ weeks)
- **Risk Assessment**: Low, Medium, High (technical complexity, regulatory impact)

---

## Epic 1: Cell Sorter Integration

**Business Value**: Enable high-throughput cell screening with automated telemetry ingestion  
**Regulatory Impact**: FDA 21 CFR Part 11 e-signatures, equipment qualification (IQ/OQ/PQ)  
**Dependencies**: None (foundational)

### Stories

#### 1.1 Cell Sorter Device Adapters
- **Priority**: Must-have (MVP)
- **Size**: Medium (1-2 weeks)
- **Risk**: Medium (vendor SDK integration)
- **Description**: Implement adapters for BD FACSAria, Sony SH800S, Miltenyi MACSQuant
- **Acceptance Criteria**:
  - Real-time telemetry ingestion (purity, recovery, sort events)
  - OPC-UA and REST API support
  - Error handling and retry logic
  - Unit tests with 95% coverage
- **Technical Notes**: Use `pycomm3` for OPC-UA, vendor SDKs via Python bindings
- **Blockers**: None

#### 1.2 Sort Job Orchestration UI
- **Priority**: Should-have (MVP)
- **Size**: Medium (1-2 weeks)
- **Risk**: Low
- **Description**: Web UI for sort job submission, monitoring, and approval
- **Acceptance Criteria**:
  - Operator submits sort parameters (gates, target populations)
  - Real-time progress visualization (scatter plots, histograms)
  - E-signature capture for job approval
  - Export sort report as PDF
- **Dependencies**: Story 1.1 (adapters)
- **Technical Notes**: React frontend, WebSocket for real-time updates

#### 1.3 Policy Enforcement Engine
- **Priority**: Must-have (MVP)
- **Size**: Small (1-3 days)
- **Risk**: High (regulatory compliance)
- **Description**: Rule engine to block sort jobs violating biosafety or export control
- **Acceptance Criteria**:
  - Rules loaded from YAML config (biosafety levels, select agents)
  - Pre-flight checks before sort job dispatch
  - Audit trail of policy violations
  - Admin UI to update rules
- **Dependencies**: Story 1.1
- **Technical Notes**: Use `drools` or `py-rules` for rule evaluation

---

## Epic 2: Image Analytics

**Business Value**: Automate colony counting, Gram staining, and cell lysis detection  
**Regulatory Impact**: Method validation (IQ/OQ/PQ), data integrity (ALCOA+)  
**Dependencies**: Seed resources (templates + datasets) already delivered

### Stories

#### 2.1 Viable Counts Image Pipeline
- **Priority**: Must-have (MVP)
- **Size**: Large (2-4 weeks)
- **Risk**: Medium (segmentation accuracy)
- **Description**: End-to-end pipeline from OME-TIFF ingestion to CFU estimation
- **Acceptance Criteria**:
  - U-Net segmentation with IoU >0.85
  - Connected component analysis for colony counting
  - MAE ≤2 colonies on benchmark set
  - Bootstrap uncertainty quantification (95% CI)
  - Replicate QC (ANOVA homogeneity test)
- **Dependencies**: `viable-counts-image-pipeline-v1.yaml` (template)
- **Technical Notes**: PyTorch for U-Net, scikit-image for CCA

#### 2.2 Gram Stain Classifier
- **Priority**: Should-have (Phase 1)
- **Size**: Medium (1-2 weeks)
- **Risk**: Medium (class imbalance)
- **Description**: CNN classifier for Gram-positive vs Gram-negative staining
- **Acceptance Criteria**:
  - Slide-level AUC ≥0.95
  - Per-class precision ≥0.90
  - Grad-CAM saliency maps for interpretability
  - Ambiguity detection (confidence threshold <0.7)
- **Dependencies**: `gram-stain-classifier-v1.yaml` (template)
- **Technical Notes**: EfficientNet-B3 or ResNet-50 backbone

#### 2.3 Cell Lysis Detection
- **Priority**: Could-have (Phase 2)
- **Size**: Medium (1-2 weeks)
- **Risk**: Low
- **Description**: Detect membrane integrity loss from imaging + flow cytometry
- **Acceptance Criteria**:
  - Fluorescence imaging (DAPI + PI) segmentation
  - Flow cytometry FSC/SSC gating
  - Per-cell lysis classification (intact vs lysed)
  - Control validation (negative <5%, positive >90%)
- **Dependencies**: `cell-lysis-detection-v1.yaml` (template)
- **Technical Notes**: Combine imaging + flow data with Pearson correlation

#### 2.4 Whole-Slide Microscopy Viewer
- **Priority**: Could-have (Phase 2)
- **Size**: Large (2-4 weeks)
- **Risk**: Low
- **Description**: Web-based viewer for whole-slide images (WSI) with annotation
- **Acceptance Criteria**:
  - Load WSI in OME-TIFF format (10GB+ files)
  - Tile-based streaming (zoom levels 1-40×)
  - Annotation tools (polygons, points, text)
  - Export annotations as JSON
- **Dependencies**: None
- **Technical Notes**: OpenSeadragon for tile rendering, OpenSlide for WSI backend

---

## Epic 3: Proteomics & Mass Spectrometry

**Business Value**: Quantify total protein and integrate proteomics workflows  
**Regulatory Impact**: Method validation, data integrity, 21 CFR Part 11  
**Dependencies**: MS instrument integration (vendor-specific)

### Stories

#### 3.1 MS Data Ingestion (mzML)
- **Priority**: Must-have (MVP)
- **Size**: Small (1-3 days)
- **Risk**: Low
- **Description**: Ingest mzML/mzXML files from MS instruments
- **Acceptance Criteria**:
  - Parse mzML with `pymzML`
  - Extract spectra, retention times, intensities
  - Store in TimescaleDB for time-series queries
  - Handle compressed (.mzML.gz) files
- **Dependencies**: None
- **Technical Notes**: Use `pymzML` library

#### 3.2 MaxQuant/DIA-NN Integration
- **Priority**: Should-have (Phase 1)
- **Size**: Large (2-4 weeks)
- **Risk**: High (external tool dependencies)
- **Description**: Containerized pipeline for protein identification and quantification
- **Acceptance Criteria**:
  - Docker containers for MaxQuant 2.x and DIA-NN 1.8+
  - Nextflow/nf-core workflow orchestration
  - Peptide ID at 1% FDR
  - iBAQ/LFQ quantification
  - Export to mzTab and JSON
- **Dependencies**: Story 3.1
- **Technical Notes**: Use `nf-core/proteomicslfq` as starting point

#### 3.3 Total Protein Dashboard
- **Priority**: Should-have (Phase 1)
- **Size**: Medium (1-2 weeks)
- **Risk**: Low
- **Description**: Interactive dashboard for protein QC metrics
- **Acceptance Criteria**:
  - Visualize protein intensity distributions
  - Spike recovery validation (80-120% expected)
  - Coefficient of variation (CV) heatmaps
  - Export plots as PNG/SVG
- **Dependencies**: Story 3.2
- **Technical Notes**: Plotly Dash or Streamlit

---

## Epic 4: Digital Twins & Virtual Labs

**Business Value**: Enable protocol validation and operator training without physical runs  
**Regulatory Impact**: Process validation (Stage 1 - Design), IQ/OQ/PQ for software  
**Dependencies**: Mechanistic models + surrogate models

### Stories

#### 4.1 2L Fermentor Digital Twin
- **Priority**: Must-have (MVP)
- **Size**: XL (4+ weeks)
- **Risk**: High (model accuracy)
- **Description**: Hybrid mechanistic + surrogate model for 2L bench-scale fermentor
- **Acceptance Criteria**:
  - Mechanistic models (Monod kinetics, mass balance, heat transfer)
  - Surrogate models (NN for biomass, GP for product titer)
  - R² ≥0.90 vs physical fermentation data
  - Shadow-mode sync with physical instrument
  - Validation protocol (OQ) with 3 test scenarios
- **Dependencies**: `digital-twin-fermentor-2L.json` (schema already created)
- **Technical Notes**: PyTorch for NN, GPyTorch for GP, `scipy.integrate.solve_ivp` for ODE solver

#### 4.2 Cell Sorter Digital Twin
- **Priority**: Could-have (Phase 2)
- **Size**: Large (2-4 weeks)
- **Risk**: Medium
- **Description**: Simulate sort efficiency and purity for parameter optimization
- **Acceptance Criteria**:
  - Gating logic simulation (Boolean gates, hierarchical)
  - Predict purity and recovery from pre-sort histograms
  - Monte Carlo uncertainty (100 runs)
  - Export sort strategy recommendations
- **Dependencies**: Story 1.1
- **Technical Notes**: Use FlowJo gating as reference

#### 4.3 Virtual Lab 3D Environment
- **Priority**: Won't-have (Phase 2)
- **Size**: XL (4+ weeks)
- **Risk**: High (3D rendering + WebGL)
- **Description**: Interactive 3D simulation of lab equipment (fermentor, sorter, microscope)
- **Acceptance Criteria**:
  - 3D models of equipment in Three.js
  - Operator training scenarios (setup, calibration, troubleshooting)
  - VR/AR support (Oculus Quest, HoloLens)
  - Score operator performance
- **Dependencies**: Stories 4.1, 4.2
- **Technical Notes**: Three.js/ThreeFiber, Unity WebGL for VR

---

## Epic 5: Batch Production Records (BPR) & Compliance

**Business Value**: FDA/Health Canada compliance for manufacturing  
**Regulatory Impact**: 21 CFR Part 11 (critical), GMP documentation  
**Dependencies**: E-signature infrastructure

### Stories

#### 5.1 BPR Template Engine
- **Priority**: Must-have (MVP)
- **Size**: Medium (1-2 weeks)
- **Risk**: High (regulatory)
- **Description**: Generate BPR from protocol execution with e-signatures
- **Acceptance Criteria**:
  - BPR template YAML defines required sections
  - Populate BPR from protocol run data
  - E-signature capture (operator, reviewer, QA)
  - Export as PDF with embedded signatures
  - 20-year retention (S3 Glacier)
- **Dependencies**: `bpr-template-v1.yaml` (template already created)
- **Technical Notes**: ReportLab for PDF, AWS S3 + Glacier for storage

#### 5.2 Audit Trail Viewer
- **Priority**: Should-have (Phase 1)
- **Size**: Small (1-3 days)
- **Risk**: Low
- **Description**: Web UI to search and view audit trails
- **Acceptance Criteria**:
  - Full-text search (user, action, timestamp, resource)
  - Filter by date range, user, action type
  - Export audit log as CSV
  - Tamper-evident log (SHA256 chaining)
- **Dependencies**: Story 5.1
- **Technical Notes**: Elasticsearch for search, PostgreSQL for log storage

---

## Epic 6: MLOps & Model Governance

**Business Value**: Continuous learning and model drift detection  
**Regulatory Impact**: Model validation, change control, retraining protocols  
**Dependencies**: ML infrastructure (MLflow, model registry)

### Stories

#### 6.1 Model Registry
- **Priority**: Should-have (Phase 1)
- **Size**: Medium (1-2 weeks)
- **Risk**: Low
- **Description**: Centralized registry for all ML models with versioning
- **Acceptance Criteria**:
  - Register models (U-Net, EfficientNet, GP)
  - Track versions (semantic versioning)
  - Deployment stages (staging, production, archived)
  - Model metadata (training data, hyperparameters, metrics)
- **Dependencies**: None
- **Technical Notes**: MLflow Model Registry

#### 6.2 Drift Detection Pipeline
- **Priority**: Should-have (Phase 1)
- **Size**: Medium (1-2 weeks)
- **Risk**: Medium
- **Description**: Automated monitoring for model performance degradation
- **Acceptance Criteria**:
  - Track prediction accuracy over time
  - Alert when accuracy drops >10% vs baseline
  - CUSUM control charts for drift detection
  - Trigger retraining workflow
- **Dependencies**: Story 6.1
- **Technical Notes**: Prometheus for metrics, Grafana for dashboards

#### 6.3 Retraining Workflow
- **Priority**: Could-have (Phase 2)
- **Size**: Large (2-4 weeks)
- **Risk**: High (automation complexity)
- **Description**: Automated retraining pipeline with shadow-mode validation
- **Acceptance Criteria**:
  - Collect new production data (post-deployment)
  - Retrain model with updated data
  - Shadow-mode validation (compare to production model)
  - Promote if accuracy improves >5%
  - Change control record (CCR) for promotion
- **Dependencies**: Stories 6.1, 6.2
- **Technical Notes**: Airflow/Prefect for orchestration, Kubeflow for ML pipelines

---

## Release Phases

### Phase MVP (Delivered)
**Target**: Q4 2025 (December 10, 2025)  
**Status**: ✅ **COMPLETED**  
**Deliverables**:
- 8 YAML templates (3,740 lines)
- 5 synthetic datasets (770+ samples)
- 3 Jupyter notebooks (2,150 lines)
- 2 agent runbooks (1,100 lines)
- 1 digital twin schema (550 lines)
- GitHub Actions CI pipeline (350 lines)

**Stories Included**:
- Epic 1: Stories 1.1, 1.3 (cell sorter adapters + policy engine)
- Epic 2: Story 2.1 (viable counts pipeline)
- Epic 4: Story 4.1 (2L fermentor digital twin)
- Epic 5: Story 5.1 (BPR template engine)
- Epic 6: Story 6.1 (model registry)

---

### Phase 1 (Production Hardening)
**Target**: Q1 2026 (January-March)  
**Duration**: 3 months  
**Team Size**: 4-6 engineers

**Goals**:
- Production deployment of MVP features
- Operator acceptance testing
- Regulatory documentation (IQ/OQ/PQ)
- Performance optimization (latency, throughput)

**Stories Included**:
- Epic 1: Story 1.2 (sort job UI)
- Epic 2: Story 2.2 (Gram stain classifier)
- Epic 3: Stories 3.1, 3.2, 3.3 (MS ingestion + MaxQuant + dashboard)
- Epic 5: Story 5.2 (audit trail viewer)
- Epic 6: Story 6.2 (drift detection)

**Milestones**:
- Week 4: Operator training complete
- Week 8: First production BPR generated
- Week 12: FDA pre-submission meeting preparation

---

### Phase 2 (Enterprise Features)
**Target**: Q2-Q3 2026 (April-September)  
**Duration**: 6 months  
**Team Size**: 8-10 engineers

**Goals**:
- Advanced analytics (cell lysis, whole-slide viewer)
- Multi-instrument digital twins
- Virtual lab environment
- Federated learning (tenant isolation)

**Stories Included**:
- Epic 2: Stories 2.3, 2.4 (cell lysis + WSI viewer)
- Epic 4: Stories 4.2, 4.3 (sorter twin + virtual lab)
- Epic 6: Story 6.3 (retraining workflow)

**Milestones**:
- Month 2: Cell lysis detection deployed
- Month 4: Virtual lab beta release
- Month 6: Federated learning pilot with 3 customers

---

## Dependency Map

```
Epic 1 (Cell Sorter)
├─ 1.1 Adapters → 1.2 UI, 1.3 Policy Engine
└─ 1.1 → Epic 4.2 (Sorter Twin)

Epic 2 (Imaging)
├─ 2.1 Viable Counts (standalone)
├─ 2.2 Gram Stain (standalone)
└─ 2.3 Cell Lysis (standalone)

Epic 3 (Proteomics)
├─ 3.1 MS Ingestion → 3.2 MaxQuant → 3.3 Dashboard

Epic 4 (Digital Twins)
├─ 4.1 Fermentor Twin (standalone)
├─ 4.2 Sorter Twin → depends on 1.1
└─ 4.3 Virtual Lab → depends on 4.1, 4.2

Epic 5 (BPR)
├─ 5.1 BPR Engine → 5.2 Audit Viewer

Epic 6 (MLOps)
├─ 6.1 Model Registry → 6.2 Drift Detection → 6.3 Retraining
```

---

## Risk Mitigation

### High-Risk Stories
1. **Story 4.1 (Fermentor Twin)**: Model accuracy requirements
   - Mitigation: Incremental validation (start with simple Monod, add complexity)
   - Fallback: Use deterministic models only (no ML)

2. **Story 3.2 (MaxQuant Integration)**: External tool dependencies
   - Mitigation: Containerize tools, freeze versions
   - Fallback: Manual MaxQuant runs with API ingestion

3. **Story 1.3 (Policy Engine)**: Regulatory compliance
   - Mitigation: Legal/regulatory review every sprint
   - Fallback: Manual approval workflow (no automation)

### Medium-Risk Stories
- **Story 2.1 (Viable Counts)**: Segmentation accuracy
  - Mitigation: Extensive synthetic data augmentation
- **Story 6.2 (Drift Detection)**: False positive alerts
  - Mitigation: Tune alert thresholds with production data

---

## Success Metrics

### Technical KPIs
- Image pipeline MAE ≤2 colonies
- OD→Biomass R² ≥0.90
- Digital twin R² ≥0.85
- System uptime ≥99.5%
- API latency p95 <500ms

### Business KPIs
- 50% reduction in manual colony counting time
- 10× increase in sort job throughput
- ROI positive within 6 months

### Regulatory KPIs
- Zero 21 CFR Part 11 violations
- 100% audit trail completeness
- <2-week turnaround for FDA submissions

---

## Appendix: Story Template

```yaml
story_id: "EPIC-X.Y"
title: "Story Name"
epic: "Epic Name"
priority: "Must-have | Should-have | Could-have | Won't-have"
size: "Small | Medium | Large | XL"
risk: "Low | Medium | High"
description: "User story in format: As a <role>, I want <feature> so that <benefit>"
acceptance_criteria:
  - "Criterion 1"
  - "Criterion 2"
dependencies:
  - "EPIC-X.Z"
technical_notes: "Implementation details, libraries, architecture notes"
blockers: "None | List of blockers"
```

---

## Change Log
- **v1.0.0** (2025-12-10): Initial backlog for Phase 2 MVP
