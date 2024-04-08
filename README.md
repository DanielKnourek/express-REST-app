# Express.js REST api demo

This demo is a part of the admission procedure.

## Description

This is a simple app that only has REST api endpoints. It is built with Express.js and uses Mysql as a database with Mysql2 as a driver. The app is dockerized and can be run with docker-compose.

## Prerequisites

- docker engine
    - Docker Desktop is fine
- vscode (optional)
    - or any other code editor
- git


## Installation

1. Clone the repository
    ```BASH
    git clone https://github.com/DanielKnourek/ express-REST-app
    ```

2. Open vscode in the project folder
    ```BASH
    cd express-REST-app
    code .
    # Or directly
    code ./express-REST-app
    ```

3. Reopen project in container  
Open command pallete (<kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>p</kbd>) and run `Remote-Containers: Reopen in Container`.

4. copy `.env.example` to `.env` and fill in the values  
    Values can be found in the [`docker-compose.yml`](.devcontainer/docker-compose.yml#L24) file.

    ```BASH
    cp .env.example .env
    ```

5. Run the app  
Upon reopening the project in container. To start the app press <kbd>F5</kbd> or run folowing command in the terminal.
    ```BASH
    # inicialize database and run the app 
    yarn migration:latest

    yarn dev
    ```

## Usage

this app has multiple endpoints. The endpoints are listed below. Every endpoint requires a token to be passed in the header. The token is `Bearer {token}`. There is a single user admin user with the following token `Bearer 0000000000000000000000000000000000000000000000000000000000000000` (64 zeros). The token is hardcoded in the app and is not secure. The token is used for demonstration purposes only.

### Customer

- GET /api/customer
    <details>
    <summary>details</summary>

    List all customers. This endpoint requires an admin token in the header.
    ```yaml
    - method: GET
    - path: /api/customer
    - headers:
        - Authorization: Bearer {token}
    - access: admin
    ```

    example:

    ```BASH
    # Works! ✔
    # returns all customers, array with one system customer
    curl -X GET -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' http://localhost:8000/api/customer

    # Doesn't work! ❌
    # returns `Missing or invalid access token`
    curl -H "Content-Type: application/json" -X GET http://localhost:8000/api/customer
    ```
    </details>

- POST /api/customer
    <details>
    <summary>details</summary>

    Create a new customer. This endpoint requires an admin token in the header.
    ```yaml
    - method: POST
    - path: /api/customer
    - headers:
        - Authorization: Bearer {token}
    - access: admin
    - body:
        - name: string
    ```

    example:

    ```BASH
    # Works! ✔
    # returns the created customer
    curl -X POST -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' -d '{ "display_name": "UK secret service" }' http://localhost:8000/api/customer

    # Doesn't work! ❌
    # returns `Invalid data for new customer`
    curl -X POST -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' http://localhost:8000/api/customer
    ```
    </details>

- DELETE /api/customer/:customer_uuid
    <details>
    <summary>details</summary>

    Delete a customer. This endpoint requires an admin token in the header.
    ```yaml
    - method: DELETE
    - path: /api/customer/:customer_uuid
    - headers:
        - Authorization: Bearer {token}
    - access: admin
    ```

    example:

    ```BASH
    # Works! ✔
    # returns the deleted customer
    # '939546c4-a831-48d5-a95f-d3fdb1f76f4e' is the uuid of the customer returned by the POST request previously or from the GET request
    curl -X DELETE -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' http://localhost:8000/api/customer/939546c4-a831-48d5-a95f-d3fdb1f76f4e
    ```
    </details>

### User

- GET /api/customer/:customer_uuid/user
    <details>
    <summary>details</summary>

    List all users of a customer. This endpoint requires an member or admin token in the header.
    ```yaml
    - method: GET
    - path: /api/customer/:customer_uuid/user
    - headers:
        - Authorization: Bearer {token}
    - access: member, admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns array of users
    # '99dd505a-dbb5-4f83-9798-c9bab2fe38fc' is the uuid of the customer returned by the POST request previously or from the GET request. Currently, there is no user under this customer uuid. try agin after creating a user.
    curl -X GET -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/user
    ```
    </details>
    
- POST /api/customer/:customer_uuid/user
    <details>
    <summary>details</summary>

    Create a new user. This endpoint requires an member or admin token in the header.
    ```yaml
    - method: POST
    - path: /api/customer/:customer_uuid/user
    - headers:
        - Authorization: Bearer {token}
    - access: member, admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns the created user
    # '99dd505a-dbb5-4f83-9798-c9bab2fe38fc' is the uuid of the customer returned by the POST request previously or from the GET request.
    curl -X POST -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' -d '{ "username":"M", "full_name": "Agent M", "role": "customer" }' http://localhost:8000/api/customer99dd505a-dbb5-4f83-9798-c9bab2fe38fc/user
    
    # Works! ✔
    # returns the created user
    # User that is member of this customer can also create a user. eg. using access token of Agent M.
    curl -X POST -H "Content-Type: application/json" --header 'Authorization: Bearer CC5D0FA4FC5A9B83E737337B60E90057967B11BC47524090606F361A6EDF1937' -d '{ "username": "bond007", "full_name": "James Bond", "role": "customer" }' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/user
    ```
    </details>

- DELETE /api/customer/:customer_uuid/user/:user_uuid
    <details>
    <summary>details</summary>

    Delete a user. This endpoint requires an member or admin token in the header.
    ```yaml
    - method: DELETE
    - path: /api/customer/:customer_uuid/user/:user_uuid
    - headers:
        - Authorization: Bearer {token}
    - access: member, admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns uuid of deleted user
    curl -X DELETE -H "Content-Type: application/json" --header 'Authorization: Bearer CC5D0FA4FC5A9B83E737337B60E90057967B11BC47524090606F361A6EDF1937' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/user/88ed9414-4a2b-4d90-bd7f-186d50982d30
    ```
    </details>

### Service

- GET /api/customer/:customer_uuid/service
    <details>
    <summary>details</summary>

    List all services of a customer. This endpoint requires an member or admin token in the header.
    ```yaml
    - method: GET
    - path: /api/customer/:customer_uuid/service
    - headers:
        - Authorization: Bearer {token}
    - access: member, admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns array of services
    # '99dd505a-dbb5-4f83-9798-c9bab2fe38fc' is the uuid of the customer returned by the POST request previously or from the GET request. Currently, there is no service under this customer uuid. try agin after creating a service.
    curl -X GET -H "Content-Type: application/json" --header 'Authorization: Bearer CC5D0FA4FC5A9B83E737337B60E90057967B11BC47524090606F361A6EDF1937' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/service
    ```
    </details>

- POST /api/customer/:customer_uuid/service
    <details>
    <summary>details</summary>

    Create a new service. This endpoint requires an member or admin token in the header.
    ```yaml
    - method: POST
    - path: /api/customer/:customer_uuid/service
    - headers:
        - Authorization: Bearer {token}
    - access: member, admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns the created service
    curl -X POST -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' -d '{ "display_name": "Target disposal" }' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/service

    # Works! ✔
    # returns the created service
    # User that is member of this customer can also create a service. eg. using access token of Agent M.
    curl -X POST -H "Content-Type: application/json" --header 'Authorization: Bearer CC5D0FA4FC5A9B83E737337B60E90057967B11BC47524090606F361A6EDF1937' -d '{ "display_name": "VIP escort" }' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/service
    ```
    </details>

- DELETE /api/customer/:customer_uuid/service/:service_uuid
    <details>
    <summary>details</summary>

    Delete a service. This endpoint requires an member or admin token in the header.
    ```yaml
    - method: DELETE
    - path: /api/customer/:customer_uuid/service/:service_uuid
    - headers:
        - Authorization: Bearer {token}
    - access: member, admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns uuid of deleted service
    curl -X DELETE -H "Content-Type: application/json" --header 'Authorization: Bearer CC5D0FA4FC5A9B83E737337B60E90057967B11BC47524090606F361A6EDF1937' http://localhost:8000/api/customer/99dd505a-dbb5-4f83-9798-c9bab2fe38fc/service/d7d30b19-2a5d-4dc3-9a6c-5ec4289a2b49
    ```
    </details>

### Log

- GET /api/log/:page
    <details>
    <summary>details</summary>

    List one page of logs. This endpoint requires an admin token in the header. Sorted from newest to oldest. page size is 50.
    ```yaml
    - method: GET
    - path: /api/log/:page
    - headers:
        - Authorization: Bearer {token}
    - access: admin
    ```
    example:

    ```BASH
    # Works! ✔
    # returns array of logs
    curl -X GET -H "Content-Type: application/json" --header 'Authorization: Bearer 0000000000000000000000000000000000000000000000000000000000000000' http://localhost:8000/api/log/0

    # Doesn't work! ❌
    # return 'Unauthorized'
    # Agent M is not an admin, so he can't access the logs.
    curl -X GET -H "Content-Type: application/json" --header 'Authorization: Bearer CC5D0FA4FC5A9B83E737337B60E90057967B11BC47524090606F361A6EDF1937' http://localhost:8000/api/log/0
    ```
    </details>
