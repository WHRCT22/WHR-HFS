# WHR-HFS Server
![WHR-HFS](image/cmd.png)
## Introduction
WHR-HFS is a server application that provides file upload, download, and streaming services.

## Installation
To install and run the WHR-HFS server, follow these steps:

1. Clone the repository
2. Install the necessary node modules using `npm install`
3. Run the server using `node app.js`

## Features
- File Upload and Download
- Websocket Chat Server
- Notification and Permissions

## Usage
Once the server is running, you can access the functionality using the following endpoints:

- File Upload: `/WHR-HFS-API/Upload`
- File List: `/WHR-HFS-API/Files-list`
- File Download: `/WHR-HFS-API/Download/{filename}`
## Web UI
![WHR-HFS](image/web.png)
## Example
```javascript
// Start the application
const port = 11452;
app.listen({port}, '0.0.0.0', () => {
    // Display server information
    console.log("Application Online");
    console.log("System Status: Running");
    console.log("Local Port: 11452");
    console.log("Server IP: 0.0.0.0");
    console.log("Storage Folder: {uploadfolder}");
    // Display WebSocket information
    console.log("Websocket is running at {wsport}");
    console.log("Url path '{websocketurl}'");
    // Display request information
    console.log("======请求信息显示======");
});
```
## Contributors
##### WHRSTUDIO
##### WZH-Team
## License
This project is licensed under the MIT License - see the LICENSE file for details.
