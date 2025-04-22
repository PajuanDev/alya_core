
from celery import Celery

app = Celery('alya', broker='redis://redis:6379/0')

@app.task
def example_task(x, y):
    return x + y
