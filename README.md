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

CMS Comparison
---

| Name      | File Count    | LOC Count   | RepoQ  | Market Share   |
| --------- | ------------- | ----------- | ------ | -------------- |
| WordPress | 1387          | 630165      | N/A    | 59.6% (18 mil) |
| Pico      | 16            | 5396        | 14992  | < .01% (200)   |
| Winter    | 10            | 1768        | 0      | < .01%  (1)    |

http://repoq.com/lists/content_management_systems_(cms)
https://w3techs.com/technologies/overview/content_management/all

```

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

$ tokei pico
-------------------------------------------------------------------------------
 Language            Files        Lines         Code     Comments       Blanks
-------------------------------------------------------------------------------
 JSON                    1           52           52            0            0
 Markdown                9         1487         1487            0            0
 PHP                     6         3857         1531         1966          360
-------------------------------------------------------------------------------
 Total                  16         5396         3070         1966          360
-------------------------------------------------------------------------------
```

Image Credits
---
swimming.jpeg -- https://unsplash.com/photos/aEtl64kP8mk
shipwreck.jpeg -- https://unsplash.com/photos/BMJWpck6eQA
Shutterstock
