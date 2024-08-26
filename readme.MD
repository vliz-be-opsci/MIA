# MIA's

## 1. Introduction

MIA or Marine Info Affordances is a project that aims to provide information about the marine environment to the user. 
All information that comes from marineinfo.org has been tripelised and can be retrieved via accessing their respective ttl URI's.
This information can then be displayed in a user-friendly way to the user via pop-up cards.

## 2. How to implement on your website 

To implement MIA on your website, you need to include the following code in your HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Marine Info Affordances</title>
    <script src="https://open-science.vliz.be/MIA/dist/mia.bundle.js" id="mia_script"
        deref-config="https://open-science.vliz.be/MIA/test/deref_config.json"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    your website content here
</body>
</html>
```

the 'deref-config' attribute in the script tag is used to configure the dereferencing of the URIs. The deref_config.json file contains the configuration for the dereferencing of the URIs. The configuration file should be placed in the same directory as the HTML file.
A default configuration file is provided in the test folder of the MIA repository.

## 3. developers

### installation

To install the MIA project, you need to clone the repository and run the following commands:

```bash
npm install
npm run build
```

### running the project

To run the project, you need to run the following command:

```bash
npm run watch
```

```bash
http-server
```

These commands will start a localhost server on port 8080 and you can access the project by going to http://localhost:8080.
The project will be running in watch mode, so any changes you make to the code will be automatically reflected in the browser.