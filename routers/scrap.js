import axios from "axios";
import express, { response } from "express";
import cheerio from "cheerio";

const router = express.Router();

const categories = {
  balo: 27608,
  phone: 1795,
};

const urlKeys = {
  balo: "balo",
  phone: "dien-thoai-smartphone",
};

let limit = 15,
  page = 1,
  category = categories.phone,
  urlKey = urlKeys.phone;

const BALO_URI = `https://tiki.vn/api/personalish/v1/blocks/listings?limit=${limit}&page=${page}&include=advertisement&aggregations=2&trackity_id=da5a36f8-d3af-bdd2-665d-eab50bdc0810&category=${category}&urlKey=${urlKey}`;
const PHONE_URI = `https://tiki.vn/api/personalish/v1/blocks/listings?limit=${limit}&page=${page}&include=advertisement&aggregations=2&trackity_id=da5a36f8-d3af-bdd2-665d-eab50bdc0810&category=${category}&urlKey=${urlKey}`;
const CATEGORY_URI = `https://tiki.vn/api/personalish/v1/blocks/categories?block_code=featured_categories&trackity_id=da5a36f8-d3af-bdd2-665d-eab50bdc0810`;
const PHONE_URL =
  "https://tiki.vn/dien-thoai-smartphone/c1795?itm_campaign=tiki-reco_UNK_DT_UNK_UNK_featured-categories_UNK_UNK_UNK_MD_batched_CID.1795&itm_medium=CPC&itm_source=tiki-reco";

// CUSTOM
let CHOOSE_URI = PHONE_URI;

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
          name: item.name,
          categories: [item.brand_name] || [],
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

    return res.status(200).json(end_data);
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default router;
