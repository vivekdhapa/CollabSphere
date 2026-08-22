import axios from 'axios';

async function main() {
  try {
    const loginRes = await axios.post('http://localhost:8000/api/v1/auth/login', {
      email: "vivek.dhapa@gmail.com", 
      password: "password123"
    });
    
    const cookie = loginRes.headers['set-cookie'].join('; ');
    
    // fetch user profile if no projects returned
    const projRes = await axios.get('http://localhost:8000/api/v1/projects', {
      headers: { Cookie: cookie }
    });
    
    if (projRes.data.data.length === 0) {
        console.log("No projects found");
        return;
    }
    const projectId = projRes.data.data[0]._id;
    console.log("Project ID:", projectId);
    
    const tasksRes = await axios.get(`http://localhost:8000/api/v1/tasks/${projectId}`, {
      headers: { Cookie: cookie }
    });
    
    if (tasksRes.data.data.length === 0) {
        console.log("No tasks found");
        return;
    }
    const taskId = tasksRes.data.data[0]._id;
    console.log("Task ID:", taskId);
    
    const taskRes = await axios.get(`http://localhost:8000/api/v1/tasks/${projectId}/t/${taskId}`, {
      headers: { Cookie: cookie }
    });
    console.log("Subtasks from API:", JSON.stringify(taskRes.data.data.subtasks, null, 2));

  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}

main();
