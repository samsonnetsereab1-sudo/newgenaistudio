// Simple test to call the API and see what happens

async function test() {
  console.log('Testing /api/generate endpoint...');
  
  try {
    const response = await fetch('http://localhost:4001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Create a sample tracking system'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

test();
