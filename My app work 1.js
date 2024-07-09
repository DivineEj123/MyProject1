const electron = require('electron');
const url = require('url');
const path = require("path");

const {app, BrowserWindow, Menu, ipcMain} = electron;

//Set environment
process.env.NODE_ENV = 'production'; // or "development"

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: "file: ",
        slashes: true
    }));
    //Quit app when closed
    mainWindow.on("closed", function(){
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(maMeTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
    //Create new window
    addWindow = new BrowserWindow({
        width: 200,
        height:300,
        title: "Add Shopping List Item",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: "file: ",
        slashes: true
    }));
    //Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Catch item add
ipcMain.on("item:add",function(e, item){
    //console.log(item)
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create menu template
const maMeTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add Item",
                click(){
                    createAddWindow();
                }
            },
            {
                label: "Clear items",
                click(){
                    mainWindow.webContents.send("item:clear");
                }
            },
            {
               label: 'Quit',
               accelerator: process.platform == "darwin" ? 'Command+Q' :
               "Ctrl+Q",
               click(){
                app.quit();
               } 
            }
        ]
    }
]; 

//If mac, add empty object to menu
if (process.platform == "darwin"){
    maMeTemplate.unshift({});
}

//Add developer tools item if not in production
if(process.env.NODE_ENV !== "production"){
    maMeTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: process.platform == "darwin" ? 'Command+I' :
               "Ctrl+I",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
           {
            role: 'reload'
           } 
        ]
    });
}
