from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from typing import List, Dict

app = Flask(__name__)
CORS(app)

# Dummy database to store projects
dummy_projects: List[Dict] = [
    {
        "id": 1,
        "description": "A machine learning project that classifies images using TensorFlow",
        "githubUrl": "https://github.com/example/ml-classifier",
        "tags": ["machine-learning", "tensorflow", "computer-vision"]
    },
    {
        "id": 2,
        "description": "React component library with customizable themes",
        "githubUrl": "https://github.com/example/react-components",
        "tags": ["react", "ui-library", "frontend"]
    },
    {
        "id": 3,
        "description": "Python backend API using FastAPI and PostgreSQL",
        "githubUrl": "https://github.com/example/fastapi-backend",
        "tags": ["python", "fastapi", "postgresql"]
    }
]

def search_projects(query: str) -> List[Dict]:
    """
    Returns all projects regardless of query.
    """
    return dummy_projects

@app.route('/api/projects/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query', '')
    print(f"Received search query: {query}")  # Add this line
    
    # Simulate processing time
    time.sleep(1)
    
    results = search_projects(query)
    print(f"Returning results: {results}")  # Add this line
    return jsonify({"results": results})

@app.route('/api/projects', methods=['POST'])
def add_project():
    data = request.get_json()
    
    new_project = {
        "id": len(dummy_projects) + 1,
        "description": data.get('description', ''),
        "githubUrl": data.get('githubUrl', ''),
        "tags": data.get('tags', [])
    }
    
    dummy_projects.append(new_project)
    return jsonify(new_project), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)