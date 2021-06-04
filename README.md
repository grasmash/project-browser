

## Setup on Cloud IDE 

```
cd /home/ide
git clone https://github.com/grasmash/project-browser.git
cd project
composer create-project acquia/drupal-minimal-project .
composer config repositories.project-browser '{"type": "path", "url": "'../project-browser'", "options": {"symlink": true}}'
composer require grasmash/drupal-project-browser
drush si -y
drush en project_browser -y
# turn on error reporting
# download and install restui, enable rest endpoint
# grant permissions
# visit	/drupalorgproxy/v1/project
```

Suggest that you select "File => Open Workspace" and select `/home/ide` so you can view both the `project-browser` and `project` directories in the same workspace.
