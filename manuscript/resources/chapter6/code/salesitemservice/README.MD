
Dependencies:
```
pip install fastapi
pip install sqlalchemy
pip install pymysql
pip install cryptography
pip install "uvicorn[standard]"
```

Run FastAPI:
```
cd chapter2
export DATABASE_URL=mysql+pymysql://root:password@localhost:3306/salesitemservice
uvicorn salesitemservice.app:app
```

Run Ariadne GraphQL Server:
```
pip install ariadne
```

```
cd chapter2
uvicorn salesitemservice.app_graphql:app
```


Run GRPC server
cd chapter2
python -m salesitemservice.app_grpc

Run GRPC client
cd chapter2
python -m salesitemservice.grpc_client
