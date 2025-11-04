pipeline {
  agent any

  environment {
    REPO_URL    = 'https://github.com/oslabs-beta/cicdbot.git'
    TARGET_HOST = 'ec2-user@98.94.9.136'
    APP_DIR     = '/opt/myapp'
    SSH_CRED_ID = 'ff5b3854-5486-4b4e-bb78-2735013350ba'
  }

  stages {
    stage('Deploy to AWS EC2') {
      steps {
        sshagent(credentials: [env.SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${TARGET_HOST} '
              set -e

              echo "==== Step 0: Install git if missing ===="
              if ! command -v git >/dev/null 2>&1; then
                echo "git not found, installing..."
                sudo dnf install -y git
              fi

              echo "==== Step 1: Install Node.js if missing ===="
              if ! command -v node >/dev/null 2>&1; then
                echo "Node not found, installing..."
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo dnf install -y nodejs
              fi

              echo "==== Step 2: Prepare application directory ===="
              if [ ! -d "${APP_DIR}" ]; then
                sudo mkdir -p ${APP_DIR}
                sudo chown \$(whoami):\$(whoami) ${APP_DIR}
              fi

              echo "==== Step 3: Clone or update repository ===="
              if [ ! -d "${APP_DIR}/.git" ]; then
                git clone ${REPO_URL} ${APP_DIR}
              else
                cd ${APP_DIR}
                git pull
              fi

              cd ${APP_DIR}

              echo "==== Step 4: Install dependencies and build ===="
              npm ci || npm install
              # Uncomment if your app needs a build step (e.g. React)
              # npm run build

              echo "==== Step 5: Stop old service if running ===="
              if command -v pm2 >/dev/null 2>&1; then
                echo "Using pm2 to stop existing process..."
                pm2 delete myapp || true
              else
                echo "No pm2 found, killing any running Node.js processes..."
                pkill -f "node" || true
              fi
              sleep 2

              echo "==== Step 6: Start the new service ===="
              if ! command -v pm2 >/dev/null 2>&1; then
                echo "Installing pm2 globally..."
                sudo npm install -g pm2
              fi

              if [ -f "ecosystem.config.js" ]; then
                pm2 startOrReload ecosystem.config.js
              else
                pm2 start npm --name myapp -- start
              fi

              pm2 save

              echo "==== Step 7: Reload nginx (optional) ===="
              if systemctl is-active --quiet nginx; then
                sudo systemctl reload nginx || true
              fi

              echo "==== ✅ Deployment complete! ===="
            '
          """
        }
      }
    }
  }
}
