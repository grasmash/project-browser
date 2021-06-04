

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
drush cset system.logging error_level verbose -y
drush uli
# visit	/drupal-org-proxy/project to see all projects
# visit /drupal-org-proxy/project/ctools to see ctools project
```

Suggest that you select "File => Open Workspace" and select `/home/ide` so you can view both the `project-browser` and `project` directories in the same workspace.
