pipeline {
    agent any

    stages {
        stage('Execute Script') {
            steps {
                sh """
                bash $SCRIPT
                """

            }
        }
    }
}
