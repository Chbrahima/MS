from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pdfs')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def clean_path(path):
    """Convert relative path to absolute path and ensure it's in the pdfs directory"""
    # Remove any '../' from the path for security
    filename = os.path.basename(path.replace('../', '').replace('..\\', ''))
    return os.path.join(UPLOAD_FOLDER, filename)

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        target_path = request.form.get('path')
        
        if not file or not target_path:
            return jsonify({'error': 'Missing file or path'}), 400
            
        # Get the clean file path
        file_path = clean_path(target_path)
        
        # Save the file
        file.save(file_path)
        
        return jsonify({'message': 'File uploaded successfully', 'path': file_path}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete', methods=['POST'])
def delete_file():
    try:
        target_path = request.form.get('path')
        if not target_path:
            return jsonify({'error': 'Missing path'}), 400
            
        # Get the clean file path
        file_path = clean_path(target_path)
        
        # Delete the file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'message': 'File not found, may have been already deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
