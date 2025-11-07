pipeline {
  agent any

  environment {
    REPO_URL      = 'https://github.com/oslabs-beta/cicdbot.git'
    TARGET_HOST   = 'ec2-user@98.94.9.136'
    APP_DIR       = '/opt/myapp'
    NGINX_WEB_DIR = '/var/www/msgcenter-frontend/dist'
    SSH_CRED_ID   = 'ff5b3854-5486-4b4e-bb78-2735013350ba'
  }

  stages {
    stage('Deploy to AWS EC2') {
      steps {
        sshagent(credentials: [env.SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${TARGET_HOST} '
              set -e

              echo "==== Step 0: Ensure environment ready ===="

              # Install git if missing
              if ! command -v git >/dev/null 2>&1; then
                echo "Installing git..."
                sudo dnf install -y git
              fi

              # Install Node.js if missing
              if ! command -v node >/dev/null 2>&1; then
                echo "Installing Node.js..."
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo dnf install -y nodejs
              fi

              # Install nginx if missing
              if ! command -v nginx >/dev/null 2>&1; then
                echo "Installing nginx..."
                sudo dnf install -y nginx
                sudo systemctl enable nginx
                sudo systemctl start nginx
              fi

              echo "==== Step 1: Clean & prepare app dir ===="
              sudo rm -rf ${APP_DIR}
              sudo mkdir -p ${APP_DIR}
              sudo chown ${'$'}(whoami):${'$'}(whoami) ${APP_DIR}

              echo "==== Step 2: Clone fresh repo ===="
              git clone ${REPO_URL} ${APP_DIR}
              cd ${APP_DIR}

              echo "==== Step 3: Install deps and build ===="
              npm ci || npm install
              npm run build

              echo "==== Check build output directory ===="
              if [ ! -d "dist" ]; then
                echo "ERROR: dist directory not found after build. Abort deployment."
                exit 1
              fi

              echo "==== Step 4: Ensure Nginx web dir exists ===="
              sudo mkdir -p ${NGINX_WEB_DIR}

              echo "==== Step 5: Deploy built files to Nginx ===="
              sudo rm -rf ${NGINX_WEB_DIR}/*
              sudo cp -r ${APP_DIR}/dist/* ${NGINX_WEB_DIR}/

              echo "==== Step 6: Adjust permissions ===="
              sudo chown -R nginx:nginx ${NGINX_WEB_DIR}

              echo "==== Step 7: Restart Nginx ===="
              sudo systemctl restart nginx

              echo "==== ✅ Deployment complete! Visit: https://msg.ilessai.com ===="
            '
          """
        }
      }
    }
  }
}