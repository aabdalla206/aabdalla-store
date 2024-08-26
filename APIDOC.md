# Ecommerce Site API Documentation

This document provides detailed information about the APIs used in the Ecommerce Site. It includes descriptions of each API endpoint, their purposes, methods, parameters, return types, example requests and responses, and potential error responses.

## Endpoint 1: Fetch Product Listings

### Purpose

Retrieves a list of products available in a specified category (Mens, Womens, Childrens) for display on respective category pages.

### Method

- `GET`

### Parameters

- `category`: String. The product category. Expected values: 'mens', 'womens', 'childrens'.

### Return Type

JSON array of product objects, each containing `id`, `name`, `description`, `imageUrl`, and `price`.

### Example Request
***`GET /api/products?category=mens`***


### Example Response

```json
[
  {
    "id": "1",
    "name": "Relaxed-fit Plaid Shirt",
    "description": "Soft cotton twill, turn-down collar...",
    "imageUrl": "/img/mens-shirt.jpg",
    "price": "29.99"
  }
]
```
### Error Response

- `400` - Bad Request: Missing or invalid parameters.
- `500` - Internal Server Error: Generic server error.


## Endpoint 2: Fetch Products by Category

### Purpose

Retrieves products based on a specified category.

### Method

- `GET`

### Parameters

- `category`: String. The product category.

### Return Type

JSON array of product objects, each containing `id`, `name`, `description`, `imageUrl`, and `price`.

### Example Request

```http
GET /api/products/mens
```
### Example Response
```json
[
  {
    "id": "1",
    "name": "Relaxed-fit Plaid Shirt",
    "description": "Soft cotton twill, turn-down collar...",
    "imageUrl": "/img/mens-shirt.jpg",
    "price": "29.99"
  }
]
```
### Error Response

- `404` Not Found: Product does not exist.
- `500` Internal Server Error: Generic server error.the request.


## Endpoint 3: Fetch Products by Type

### Purpose

Retrieves products based on a specified type.

### Method

- `GET`

### Parameters

- `type`: String. The product type.

### Return Type

JSON array of product objects, each containing `id`, `name`, `description`, `imageUrl`, and `price`.

### Example Request

```http
GET /api/type/shoes
```
### Example Response
```json
[
  {
    "id": "7",
    "name": "Running Shoes",
    "description": "Comfortable and stylish running shoes...",
    "imageUrl": "/img/shoes.jpg",
    "price": "79.99"
  }
]
```
### Error Response

- `404` Not Found: Product does not exist.
- `500` Internal Server Error: Generic server error.the request.


## Endpoint 4: User Login

### Purpose

Authenticates user login.

### Method

- `POST`

### Request Body

```json
{
  "username": "exampleUser",
  "password": "examplePassword"
}
```

### Return Type

JSON object with `success` (boolean) and `message` (string).

### Example Request

```http
POST /api/login
```

### Example Response
```json
{
  "success": true,
  "message": "Login successful"
}
```
### Error Response

- `401` Unauthorized: Invalid username or password.


## Endpoint 5: User Purchase

### Purpose

Processes a user's purchase.

### Method

- `POST`

### Request Body

```json
{
  "userId": "exampleUser",
  "itemId": 1
}
```

### Example Request

```http
POST /api/purchase
```

### Example Response
```json
{
  "success": true,
  "message": "Purchase successful",
  "orderid": 12345
}
```
### Error Response

- `401` Unauthorized: Invalid username or password.
- `400` Bad Request: Invalid item ID.
- `500` Internal Server Error: Generic server error.


## Endpoint 6: User Purchase History

### Purpose

Retrieves the purchase history of a user.

### Method

- `GET`

### Parameters

- `username`: String. The username.

### Return Type

JSON object with `success` (boolean) and `purchaseHistory` (array).

### Example Request

```http
GET /api/purchase-history/exampleUser
```
### Example Response
```json
[
{
  "success": true,
  "purchaseHistory": [
    {
      "orderid": 12345,
      "items": [
        {
          "id": 1,
          "name": "Relaxed-fit Plaid Shirt",
          "description": "Soft cotton twill, turn-down collar...",
          "imageUrl": "/img/mens-shirt.jpg",
          "price": "29.99"
        }
      ]
    }
  ]
}

]
```
### Error Response

- `403` Forbidden: Unauthorized.
- `500` Internal Server Error: Generic server error.


## Endpoint 7: Fetch Recommendations

### Purpose

Fetches recommendations based on user's purchase history.

### Method

- `POST`

### Request Body

```json
{
  "itemIds": [1, 3, 5]
}
```

### Return Type

JSON object with `success` (boolean) and `recommendations` (array).

### Example Request

```http
POST /api/recommendations
```

### Example Response
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 2,
      "name": "Slim-fit Jeans",
      "description": "Comfortable and stylish slim-fit jeans...",
      "imageUrl": "/img/jeans.jpg",
      "price": "49.99"
    }
  ]
}
```
### Error Response

- `400` Bad Request: Invalid itemIds format.
- `500` Internal Server Error: Generic server error.