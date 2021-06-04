

## Setup on Cloud IDE

1. Create your IDE and log in to it:
  ```
  acli ide:create --label="Project Browser"
```
2. Suggest that you select "File => Open Workspace" and select `/home/ide` so you can view both the `project-browser` and `project` directories in the same workspace.
3. Run:
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

# Contributing

1. Authenticate the IDE with GitHub:
  ```
  gh auth login
  ```
1. Fork https://github.com/grasmash/project-browser:
  ```
  gh repo fork https://github.com/grasmash/project-browser
  ```
2. Add your fork to the cloned repo in the IDE:
  ```
  cd /home/ide/project-browser
  git remote add myfork [your fork url]
