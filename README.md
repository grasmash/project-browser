

## Setup on Acquia Cloud IDE

1. Create your IDE and log in to it:
        ```bash
        acli ide:create --label="Project Browser"
        ```
2. Suggest that you select "File => Open Workspace" and select `/home/ide` so you can view both the `project-browser` and `project` directories in the same workspace.
3. Run:
      ```bash
      # Download all code.
      cd /home/ide
      git clone https://github.com/grasmash/project-browser.git
      cd project
      composer create-project acquia/drupal-minimal-project .
      composer config repositories.project-browser '{"type": "path", "url": "'../project-browser'", "options": {"symlink": true}}'
      composer require grasmash/drupal-project-browser
      drush si -y
   
      # Enable the module.
      drush en project_browser claro -y
      drush cset system.theme admin claro
      drush uli
      # visit /admin/modules/browse 
      # visit /drupal-org-proxy/project to see all projects
      # visit /drupal-org-proxy/project/ctools to see ctools project
      ```

# Contributing

1. Authenticate the IDE with GitHub:
      ```bash
      gh auth login
      ```
2. Fork https://github.com/grasmash/project-browser:
      ```bash
      gh repo fork grasmash/project-browser
      ```
3. Add your fork to the cloned repo in the IDE:
      ```bash
      cd /home/ide/project-browser
      git remote add [your-fork-name] [your-fork-url]
      git checkout master
      git branch --set-upstream-to [my-fork-name] master
      ```
4. Install Svelte dependencies and start a "watch" process~
      ```bash
      cd sveltejs
      npm install
      npm run dev  
      ```
5. Disable Drupal's various caching mechanisms:
   ```bash
      # Disable caching for development.
      chmod 755 docroot/sites/default
      chmod 755 docroot/sites/default/settings.php
      cp docroot/sites/example.settings.local.php docroot/sites/default/settings.local.php
      echo "if (file_exists(\$app_root . '/' . \$site_path . '/settings.local.php')) {" >> docroot/sites/default/settings.php
      echo "    include \$app_root . '/' . \$site_path . '/settings.local.php';" >> docroot/sites/default/settings.php
      echo "}" >> docroot/sites/default/settings.php
      echo "\$settings['cache']['bins']['render'] = 'cache.backend.null';" >> docroot/sites/default/settings.local.php
      echo "\$settings['cache']['bins']['page'] = 'cache.backend.null';" >> docroot/sites/default/settings.local.php
      echo "\$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.null';" >> docroot/sites/default/settings.local.php
      drush cset system.logging error_level verbose -y
   ```
6. Make your changes and commit:
    ```bash
    # Make sure you complile Svelte files into HTML, CSS, and JS.
    cd sveltejs && npm run build
    git add -A
    git commit -m "I did a thing"
    gh pr create
    ```

# Changing the HTML, CSS, or JS files

Run:

```bash
cd sveltejs
npm dev
```

# Why Svelte?

This module uses Svelte as a "frontend" framework. There are many reasons to choose Svelte, but the primary reason is
that it does not require this module (or Drupal Core for that matter) to "ship" a frontend framework. Svelte is only 
used during the development process. Before "shipping," the Svelte code is compiled into "vanilla" HTML, CSS, and JS.

This avoids many of the security and deprecation issues that have historically arisen from shipping jQuery with Drupal.
It also avoids many of the licensing, performance, and dependency concerns posed by possibility of using frameworks 
like React or Vue.

## Issues to address:

### Project Browser
1. Add testing!
1. Add a lightbox to view multiple project images as full screen carousel
1. Fire event in DrupalOrgProxy allowing query to be modified before request to D.O.
1. Fire event in DrupalOrgProxy allowing projects to be modified sending response.
1. Move project to project_browser module namespace on Drupal.org.
1. Add a bunch of filters to the project browser as an advanced search option.

1. Add a "curated" or "suggested" modules section on top of the full module list.
### Blocked by Drupal.org API:
1. Filter by core compatibility
1. Sort by stars
1. Sort by usage
1. Allow keyword search (not exact title)

@see https://www.drupal.org/project/infrastructure/issues/3218285
