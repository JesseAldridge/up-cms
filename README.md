Overview
---

With Winter CMS you can use a JSON file to specify the content of a templatized web page.

[WinterCMS.com](http://www.wintercms.com)

Install
---

```
# Install NodeJs if you don't have it. On Ubuntu you can do:
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs

# Download and run the server
git clone git@github.com:JesseAldridge/winter-cms.git
cd winter-cms
npm install
node server.js 80
```

Winter vs WordPress
---

20 files vs 2000 files
2K lines vs 600K lines

```
$ tree wordpress-sample-site/ | wc -l
  1888

$ tree -I 'node_modules' winter-cms/ | wc -l
  22

$ tokei winter-cms/
-------------------------------------------------------------------------------
 Language            Files        Lines         Code     Comments       Blanks
-------------------------------------------------------------------------------
 CSS                     1           43           39            0            4
 HTML                    4          505          430            4           71
 JavaScript              1          256          215            4           37
 JSON                    3          928          928            0            0
 Markdown                1           36           36            0            0
-------------------------------------------------------------------------------
 Total                  10         1768         1648            8          112
-------------------------------------------------------------------------------

$ tokei wordpress-sample-site/
-------------------------------------------------------------------------------
 Language            Files        Lines         Code     Comments       Blanks
-------------------------------------------------------------------------------
 CSS                   205        99436        79085         4389        15962
 JavaScript            362       158874       112188        27022        19664
 JSON                    2         4491         4491            0            0
 Markdown                1          218          218            0            0
 PHP                   740       356806       192040       122539        42227
 Sass                   54         6192         4480          495         1217
 SVG                     8         1158         1155            3            0
 Plain Text             14         2947         2947            0            0
 XML                     1           43           37            0            6
-------------------------------------------------------------------------------
 Total                1387       630165       396641       154448        79076
-------------------------------------------------------------------------------
```

Image Credits
---
swimming.jpeg -- https://unsplash.com/photos/aEtl64kP8mk
shipwreck.jpeg -- https://unsplash.com/photos/BMJWpck6eQA
Shutterstock
