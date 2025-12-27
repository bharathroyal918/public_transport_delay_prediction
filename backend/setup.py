import os
import subprocess
import sys

def run_command(command, cwd=None):
    print(f"Running: {command}")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
        print("Success.")
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        # Don't exit, try to continue

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Base Dir: {base_dir}")
    
    # 1. Create Directories
    dirs = [
        os.path.join(base_dir, 'data', 'raw'),
        os.path.join(base_dir, 'data', 'models'),
        os.path.join(base_dir, 'frontend')
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"Created directory: {d}")
        
    # 2. Install Backend Dependencies
    req_path = os.path.join(base_dir, 'backend', 'requirements.txt')
    if os.path.exists(req_path):
        run_command(f"{sys.executable} -m pip install -r {req_path}")
    else:
        print(f"requirements.txt not found at {req_path}")
        
    # 3. Generate Data
    # Import generating function to avoid subprocess issues
    sys.path.append(os.path.join(base_dir, 'backend', 'utils'))
    try:
        from data_generator import generate_data
        generate_data()
    except ImportError as e:
        print(f"Could not import data_generator: {e}")
    except Exception as e:
        print(f"Error generating data: {e}")

    # 4. Setup Frontend
    # Check if frontend already has package.json
    frontend_dir = os.path.join(base_dir, 'frontend')
    if not os.path.exists(os.path.join(frontend_dir, 'package.json')):
        print("Creating Vite App...")
        # Since frontend dir exists, we might need to use '.' inside it
        # But create-vite might complain if dir is not empty. It was just created so it is empty.
        # We use 'cmd /c' to ensure shell commands like npx work
        # run_command("npx -y create-vite@latest . --template react", cwd=frontend_dir)
        # Better: run in base_dir and target 'frontend'
        # But 'frontend' exists now.
        # Let's try running inside it.
        run_command("npx -y create-vite@latest . --template react", cwd=frontend_dir)
        
        # Install frontend deps
        run_command("npm install", cwd=frontend_dir)
    
    print("Setup complete.")

if __name__ == "__main__":
    main()
