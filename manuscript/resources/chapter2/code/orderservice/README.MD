
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
export DATABASE_URL=mysql+pymysql://root:password@localhost:3306/orderservice
uvicorn orderservice.app:app
```

Run Flask:
````
pip install Flask
```

```
cd chapter2
python3 -m orderservice.app_flask
```