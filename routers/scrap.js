import axios from "axios";
import express, { response } from "express";
import cheerio from "cheerio";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const router = express.Router();

const categories = {
  balo: 27608,
  phone: 1795,
  may_tinh_bang: 1794,
  giay_the_thao_nam: 6826,
  sach_tu_duy: 871,
  truyen_tranh: 1084,
  tieu_thuyet: 844,
  truyen_ngan: 845,
  binh_giu_nhiet: 1936,
  ban_lam_viec: 4381,
  tac_pham_kinh_dien: 842,
  phu_kien_nha_bep: 2514,
  ke_va_tu: 2514,
  tu: 23622,
  sach_hoc_tieng_anh: 1856,
  tai_nghe: 8400,
};

const urlKeys = {
  balo: "balo",
  phone: "dien-thoai-smartphone",
  may_tinh_bang: "may-tinh-bang",
  giay_the_thao_nam: "giay-the-thao-nam",
  sach_tu_duy: "sach-ky-nang-song",
  truyen_tranh: "truyen-tranh",
  tieu_thuyet: "tieu-thuyet",
  truyen_ngan: "truyen-ngan-tan-van-tap-van",
  binh_giu_nhiet: "binh-giu-nhiet",
  ban_lam_viec: "ban-ghe-lam-viec",
  tac_pham_kinh_dien: "tac-pham-kinh-dien",
  phu_kien_nha_bep: "phu-kien-nha-bep-khac",
  ke_va_tu: "ke-tu",
  tu: "tu",
  sach_hoc_tieng_anh: "sach-hoc-tieng-anh",
  tai_nghe: "tai-nghe-true-wireless",
};
let customer_category = categories.tu;
let limit = 15,
  page = 1,
  category = categories.tu,
  urlKey = urlKeys.tu;

const DATA_URI = `https://tiki.vn/api/personalish/v1/blocks/listings?limit=${limit}&page=${page}&include=advertisement&aggregations=2&trackity_id=da5a36f8-d3af-bdd2-665d-eab50bdc0810&category=${category}&urlKey=${urlKey}`;
const CATEGORY_URI = `https://tiki.vn/api/personalish/v1/blocks/categories?block_code=featured_categories&trackity_id=da5a36f8-d3af-bdd2-665d-eab50bdc0810`;
const PHONE_URL =
  "https://tiki.vn/dien-thoai-smartphone/c1795?itm_campaign=tiki-reco_UNK_DT_UNK_UNK_featured-categories_UNK_UNK_UNK_MD_batched_CID.1795&itm_medium=CPC&itm_source=tiki-reco";

// CUSTOM
let CHOOSE_URI = DATA_URI;

// ROUTERS
router.get("/scrapV1", async (req, res) => {
  try {
    let phone_data = [];
    let counter = 0;
    await axios(PHONE_URL).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $(".product-item", html).each(function () {
        const thumbnail = $(this)
          .find("span > div > div.thumbnail > img")
          .attr("src");

        const title = $(this)
          .find("span > div > div.info > div.name > h3")
          .text();
        const isPriceDiscount = $(this).find("span > div > div.info");
        const tmpPrice = isPriceDiscount
          .find(".price-discount__price")
          .text()
          .split(" ₫")[0];
        const price = {
          rootPrice: 0,
          discountPrice: 0,
          discountPercent: 0,
        };

        if ($(this).find("span > div > div.info > div.has-discount")) {
          price.discountPrice = tmpPrice;
          price.discountPercent = $(this)
            .find(
              "span > div > div.info > div.has-discount > div.price-discount__discount"
            )
            .text()
            .split("-")[1]
            .split("%")[0];
        } else {
          price.rootPrice = tmpPrice;
        }

        counter++;
        console.log({ title, price });
      });
      console.log("counter: " + counter);
    });
    return res.status(200).json("hi");
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/scrapV2/categories", async (req, res) => {
  let data = [];
  await axios(CATEGORY_URI).then((res) => {
    data = res.data.items;
    res.data.items.map(async (item) => {
      if (
        item.name !== "NGON" &&
        item.name !== "Khác" &&
        item.name !== "Xe tay ga" &&
        item.name !== "Máy massage toàn thân"
      ) {
        const isCate = await Category.findOne({ id: item?.id });
        if (!isCate) {
          const category = new Category({
            id: item?.id,
            title: item?.name,
            thumbnail: item?.thumbnail_url,
          });
          await category.save();
          console.log("Category saved with title: " + item.name);
        } else {
          console.log("Existed category with title: " + item.name);
        }
      }
    });
  });

  return res.status(200).json(data);
});

router.get("/scrapV2", async (req, res) => {
  try {
    let end_data = [];
    let data_no_thumbnails = [];
    let data;
    let counter = 0;
    let thumbnails = [];
    let newThumbnails = [];
    let pid_spid = [];
    await axios(CHOOSE_URI).then(async (res) => {
      data = res.data.data;
      await res.data.data.map((item) => {
        pid_spid.push({
          id: item?.id,
          seller_product_id: item?.seller_product_id,
        });

        data_no_thumbnails.push({
          id: item?.id,
          title: item.name,
          category: customer_category,
          brand_name: [item.brand_name] || [],
          short_description: item.short_description, // new attribute
          salePrice: item.price || 0,
          discount: item.discount || 0, // new attribute
          discountRate: item.discount_rate || 0,
          rootPrice: item.original_price,
          quantitySold: item.quantity_sold?.value || 0,
          thumbnails: [],
          rating_average: item.rating_average,
          review_count: item.review_count, // new attribute
        });
        // console.log(data_no_thumbnails);

        counter++;
      });
    });

    // get all thumbnail images by product id
    await axios
      .all(
        pid_spid.map((item) => {
          return axios.get(
            `https://tiki.vn/api/v2/products/${item?.id}?platform=web&spid=${item?.seller_product_id}`
          );
        })
      )
      .then(
        axios.spread((...res) => {
          pid_spid.map((item, idx) => {
            res[idx].data.images.map((image_urls) => {
              thumbnails.push(image_urls.base_url);
            });

            newThumbnails.push({ ...item, thumbnails: thumbnails });

            thumbnails = [];
          });
        })
      )
      .catch((errors) => {
        // react on errors.
        console.log(errors);
      });
    // console.log(newThumbnails);

    if (newThumbnails && data_no_thumbnails) {
      data_no_thumbnails.map((item, idx) => {
        if (item.id === newThumbnails[idx].id) {
          end_data.push({
            ...item,
            thumbnails: newThumbnails[idx].thumbnails,
          });
        }
      });
    }
    // save data to db
    end_data.map(async (item, idx) => {
      let timer = 0;
      // console.log(item);
      const product = await Product.findOne({ id: item.id });
      if (!product) {
        const newProduct = new Product(item);
        await newProduct.save();
        console.log("Saved product with title: ", item.title);
      } else {
        console.log("Product exists on Database with: ", item.title);
      }
      // const intervalId = setInterval(async () => {
      //   const product = await Product.findOne({ id: item.id });
      //   if (!product) {
      //     const newProduct = new Product(item);
      //     await newProduct.save();
      //     timer += 2000;
      //     console.log("Saved product with title: ", item.title);
      //     if (timer === end_data.length * 2000) {
      //       clearInterval(intervalId);
      //     }
      //   } else {
      //     console.log("Product exists on Database with: ", item.title);
      //   }
      // }, 5000);
    });
    return res.status(200).json(end_data);
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default router;
