

## Setup on Cloud IDE 

cd /home/ide
git clone https://github.com/grasmash/project-browser.git
cd project
composer create-project acquia/drupal-minimal-project .
composer config repositories.project-browser '{"type": "path", "url": "'../project-browser'", "options": {"symlink": true}}'
composer require grasmash/drupal-project-browser
