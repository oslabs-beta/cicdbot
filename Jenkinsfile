pipeline { 
  agent any

  environment {
    REPO_URL    = 'https://github.com/oslabs-beta/cicdbot.git'
    TARGET_HOST = 'ec2-user@98.94.9.136'
    APP_DIR     = '/opt/myapp'
    NGINX_WEB_DIR = '/usr/share/nginx/html'
    SSH_CRED_ID = 'ff5b3854-5486-4b4e-bb78-2735013350ba'
  }

  stages {

    stage('Deploy to AWS EC2') {
      steps {
        sshagent(credentials: [env.SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${TARGET_HOST} '
              set -e
              echo "==== Step 0: Ensure environment ready ===="

              # Install dependencies if missing
              if ! command -v git >/dev/null 2>&1; then
                echo "Installing git..."
                sudo dnf install -y git
              fi

              if ! command -v node >/dev/null 2>&1; then
                echo "Installing Node.js..."
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo dnf install -y nodejs
              fi

              if ! command -v nginx >/dev/null 2>&1; then
                echo "Installing nginx..."
                sudo dnf install -y nginx
                sudo systemctl enable nginx
                sudo systemctl start nginx
              fi

              echo "==== Step 1: Prepare app dir ===="
              if [ ! -d "${APP_DIR}" ]; then
                sudo mkdir -p ${APP_DIR}
                sudo chown \$(whoami):\$(whoami) ${APP_DIR}
              fi

              echo "==== Step 2: Clone or update repo ===="
              if [ ! -d "${APP_DIR}/.git" ]; then
                git clone ${REPO_URL} ${APP_DIR}
              else
                cd ${APP_DIR}
                git pull
              fi

              cd ${APP_DIR}

              echo "==== Step 3: Install deps and build ===="
              npm ci || npm install
              npm run build

              echo "==== Step 4: Kill all Node.js processes ===="
              pkill -f "node" || true
              pkill -f "pm2" || true

              echo "==== Step 5: Deploy built files to Nginx ===="
              sudo rm -rf ${NGINX_WEB_DIR}/*
              sudo cp -r ${APP_DIR}/dist/* ${NGINX_WEB_DIR}/

              echo "==== Step 6: Adjust permissions ===="
              sudo chown -R nginx:nginx ${NGINX_WEB_DIR}

              echo "==== Step 7: Restart Nginx ===="
              sudo systemctl restart nginx

              echo "==== ✅ Deployment complete! ===="
              echo "Site available at: http://$(hostname -I | awk "{print \\$1}")"
            '
          """
        }
      }
    }
  }
}