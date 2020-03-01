# leboncoin-api-final

An [express](https://expressjs.com/) server for leboncoin clone.  

This project is hosted on Heroku : https://leboncoin-api-final.herokuapp.com/
It's used on the following frontend project : https://github.com/Cebri63/leboncoin-2003

## Routes

### User

- login
- signup

### Offer

- publish (with cloudinary upload)
- get offers (with mongoose filters)
- get one offer

### Payment

- payment via Stripe

## Packages

- [express](https://expressjs.com/)
- [cloudinary](https://www.npmjs.com/package/cloudinary)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [stripe](https://www.npmjs.com/package/stripe)

## Running the project

Clone this repository :

```
git clone https://github.com/Cebri63/leboncoin-api-final.git
cd leboncoin-api-final
```

Install packages :

```
npm install
```

When installation is complete :

```bash
node index.js
```
