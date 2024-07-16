import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const getAllProduct = async (req, res) => {
  try {
    let products = await prismaClient.product.findMany();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    let product = await prismaClient.product.findFirst({
      where: {
        productId,
      },
    });

    let userId;
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prismaClient.productSaved.findUnique({
            where: {
              productId_userId: {
                productId,
                userId: payload.userId,
              },
            },
          });
          res.status(200).json({ ...product, isSaved: saved ? true : false });
        }
      });
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const addProduct = async (req, res) => {
  const { name, description, image, price, cover, categoryId } = req.body;

  let product = await prismaClient.product.create({
    data: {
      name,
      description,
      image,
      price,
      cover,
      category: {
        connect: {
          categoryId,
        },
      },
      author: {
        create: {
          userId: req.userId,
        },
      },
    },
  });
  res.status(200).send(product);
};

export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, image, price, cover, categoryId } = req.body;
  try {
    let product = await prismaClient.product.update({
      where: {
        productId,
      },
      data: {
        name,
        description,
        image,
        price,
        cover,
        category: {
          connect: {
            categoryId,
          },
        },
        author: {
          create: {
            userId: req.userId,
          },
        },
      },
    });
    res.status(200).send(product);
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    await prismaClient.product.delete({
      where: {
        productId,
      },
    });
    res.status(200).send("ok");
  } catch (error) {
    res.status(500).send(error);
  }
};