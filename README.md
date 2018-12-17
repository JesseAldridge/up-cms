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

Wordpress Comparison
---

$ tree wordpress-sample-site/ | wc -l
  1888

$ tree -I 'node_modules' winter-cms/ | wc -l
  22

Image Credits
---
swimming.jpeg -- https://unsplash.com/photos/aEtl64kP8mk
shipwreck.jpeg -- https://unsplash.com/photos/BMJWpck6eQA
Shutterstock
