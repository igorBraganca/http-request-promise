const { Http } = require("../src/http");

test('deve fazer um get com sucesso via https', async () => {
    const http = new Http();
    const res = await http.get('https://jsonplaceholder.typicode.com/todos/1');

    expect(res.statusCode).toBe(200);
    expect(res.headers).toBeTruthy();
    expect(res.body).toHaveProperty("userId", 1)
    expect(res.body).toHaveProperty("id", 1)
    expect(res.body).toHaveProperty("title", "delectus aut autem")
    expect(res.body).toHaveProperty("completed", false)
});

test('deve fazer um get com sucesso via http', async () => {
    const http = new Http();
    const res = await http.get('http://jsonplaceholder.typicode.com/todos/1');

    expect(res.statusCode).toBe(200);
    expect(res.headers).toBeTruthy();
    expect(res.body).toHaveProperty("userId", 1)
    expect(res.body).toHaveProperty("id", 1)
    expect(res.body).toHaveProperty("title", "delectus aut autem")
    expect(res.body).toHaveProperty("completed", false)
});

test('deve fazer um post com sucesso via https', async () => {
    const http = new Http();
    const headers = {
        'Content-type': 'application/json; charset=UTF-8',
    }
    const body = {
        title: 'foo',
        body: 'bar',
        userId: 1,
    }
    const res = await http.post('https://jsonplaceholder.typicode.com/posts', body, headers);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId", 1)
    expect(res.body).toHaveProperty("id", 101)
    expect(res.body).toHaveProperty("title", "foo")
    expect(res.body).toHaveProperty("body", "bar")
});