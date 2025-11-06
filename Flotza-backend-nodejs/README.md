## Folder Structure
```
├── config
│   └── db.js
├── models
│   └── Auth
│       ├── vendor-login.js
│       ├── vendor-register.js
│       └── vendor-profile.js
├── modules
│   ├── auth
│   │   ├── controllers
│   │   │   ├── vendorController.js
│   │   │   └── index.js
│   │   ├── routes
│   │   │   ├── vendorRoutes.js
│   │   │   └── index.js
│   └── index.js
├── utils
│   ├── jwt.js
│   ├── response.js
│   ├── validation.js
│   └── fileUpload.js
├── uploads
│   └── (empty directory for storing images)
├── package.json
├── server.js
└── .env
```

### Postgres version
```
14
```

### Nodejs version
```
v18.20.8
```