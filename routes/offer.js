const express = require("express");
const cloudinary = require("cloudinary");
const router = express.Router();
const Offer = require("../models/Offer.js");
const isAuthenticated = require("../middlewares/isAuthenticated");
const formidableMiddleware = require("express-formidable");
router.use(formidableMiddleware());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CREATE
router.put("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (Object.keys(req.files).length > 0) {
      cloudinary.v2.uploader.upload(
        req.files.file.path,
        async (error, result) => {
          if (error) {
            return res.json({ error: error.message });
          } else {
            const obj = {
              title: req.fields.title,
              description: req.fields.description,
              price: req.fields.price,
              picture: result,
              creator: req.user,
            };
            const offer = new Offer(obj);
            await offer.save();

            res.json({
              _id: offer._id,
              title: offer.title,
              description: offer.description,
              price: offer.price,
              picture: offer.picture,
              created: offer.created,
              creator: {
                account: offer.creator.account,
                _id: offer.creator._id,
              },
            });
          }
        }
      );
    } else {
      const obj = {
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        creator: req.user,
      };
      const offer = new Offer(obj);
      await offer.save();

      res.json({
        _id: offer._id,
        title: offer.title,
        description: offer.description,
        price: offer.price,
        picture: offer.picture,
        created: offer.created,
        creator: {
          account: offer.creator.account,
          _id: offer.creator._id,
        },
      });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

// READ
router.get("/offer/with-count", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }
    // OK cas avec que priceMin
    // OK cas avec que priceMax
    // OK cas avec priceMin et priceMax
    if (req.query.priceMin) {
      filters.price = {
        $gte: req.query.priceMin,
      };
    }
    if (req.query.priceMax) {
      // filters.price = {
      //   $lte: req.query.priceMax,
      // };
      if (!filters.price) {
        filters.price = {};
      }
      filters.price.$lte = req.query.priceMax;
    }
    // if (req.query.priceMin && req.query.priceMax) {
    //   filters.price = {
    //     $gte: req.query.priceMin,
    //     $lte: req.query.priceMax,
    //   };
    // }
    let sort = {};
    if (req.query.sort === "date-desc") {
      sort = { date: "desc" };
    } else if (req.query.sort === "date-asc") {
      sort = { date: "asc" };
    } else if (req.query.sort === "price-asc") {
      sort = { price: "asc" };
    } else if (req.query.sort === "price-desc") {
      sort = { price: "desc" };
    }
    // Compter le nombre de résultat
    const count = await Offer.countDocuments(filters);
    let offers;
    // Récupérer des annonces
    let page = Number(req.query.page);
    if (!page) {
      // Forcer à afficher la première page
      page = 1;
    }
    let limit = 2;
    // On affiche 2 resultats par page
    // Si on me demande page 1, alors le skip est 0 et limit est 2
    // Si on me demande page 2, alors le skip est 2 et limit est 2
    // Si on me demande page 3, alors le skip est 4 et limit est 2
    console.log(filters);
    offers = await Offer.find(filters)
      .select("title price created creator picture.secure_url description")
      .populate({
        path: "creator",
        select: "account.username account.phone",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort);
    // Répondre au client
    return res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findOne({ _id: id }).populate({
      path: "creator",
      select: "account",
    });
    res.json(offer);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
