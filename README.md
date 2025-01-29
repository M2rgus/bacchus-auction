## Needed

- **Node.js**
- **json-server** (for mock database / npm install -g json-server )

## Step 1.
Frontend -

```
cd .\frontend\
npm install
npm run build
```

## Step 2.
Backend -

```
npm install

in 1 terminal window run command : json-server --watch db.json --port 5000 
(If running scripts disabled, command: Set-ExecutionPolicy Unrectricted -Scope Process)

in 2 terminal window run command : node server.js
the application should run on port:3000
```

## Step 3. (For accessing database UI)
Database - 

```
npx prisma studio
```
