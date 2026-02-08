import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://hmmipguhjbklimihatii.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbWlwZ3VoamJrbGltaWhhdGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTQ4NTAsImV4cCI6MjA4NTQ3MDg1MH0.hpoe40z9M8abumchMFm_5lSDX5kKgpB2UHiaCRixOFY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const tasksEl = document.getElementById("tasks");
const balanceEls = Array.from(document.querySelectorAll("[data-balance]"));
const fallbackBalanceEl = balanceEls.length ? null : document.getElementById("balance");
const productsEl = document.getElementById("products");
const productDetailEl = document.getElementById("productDetail");
const productNameEl = document.getElementById("productName");
const productPriceEl = document.getElementById("productPrice");
const variantCarouselEl = document.getElementById("variantCarousel");
const orderModalEl = document.getElementById("orderModal");
const orderModalOverlayEl = document.getElementById("orderModalOverlay");
const orderModalCloseEl = document.getElementById("orderModalClose");
const orderModalImageEl = document.getElementById("orderModalImage");
const orderModalTitleEl = document.getElementById("orderModalTitle");
const orderModalSubtitleEl = document.getElementById("orderModalSubtitle");
const orderModalPriceEl = document.getElementById("orderModalPrice");
const orderModalOrderEl = document.getElementById("orderModalOrder");
const orderModalMessageEl = document.getElementById("orderModalMessage");
const menuToggle = document.getElementById("menuToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const bodyEl = document.body;
let currentProduct = null;
let currentVariant = null;

const setSidebarOpen = (isOpen) => {
  bodyEl.classList.toggle("sidebar-open", isOpen);
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    setSidebarOpen(!bodyEl.classList.contains("sidebar-open"));
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    setSidebarOpen(false);
  });
}

const statusConfig = {
  todo: { type: "button", label: "Mark as done!" },
  pending_approval: { type: "label", label: "Pending approval", className: "label pending" },
  approved: { type: "label", label: "Completed!", className: "label approved" },
};

const heartString = (count) => {
  const safeCount = Math.max(0, Number(count) || 0);
  return "❤️".repeat(safeCount || 1);
};

const priceString = (price) => {
  const safePrice = Math.max(0, Number(price) || 0);
  return `Price: ${safePrice} ❤️`;
};

const buildStatusNode = (status, onClick) => {
  const config = statusConfig[status] || { type: "label", label: status || "Unknown", className: "label" };
  if (config.type === "button") {
    const button = document.createElement("button");
    button.className = "btn";
    button.type = "button";
    button.textContent = config.label;
    if (onClick) {
      button.addEventListener("click", onClick);
    }
    return button;
  }
  const label = document.createElement("span");
  label.className = config.className || "label";
  label.textContent = config.label;
  return label;
};

const updateTaskStatus = async (taskId, nextStatus, button) => {
  if (!taskId) return;
  if (button) {
    button.disabled = true;
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", taskId);

  if (error) {
    console.error("Supabase update error:", error);
    if (button) {
      button.disabled = false;
    }
    return;
  }

  await loadTasks();
};

const renderTasks = (tasks) => {
  tasksEl.innerHTML = "";
  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No tasks available yet.";
    tasksEl.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "card";

    const emoji = document.createElement("div");
    emoji.className = "emoji";
    emoji.textContent = task.emoji || "✅";

    const meta = document.createElement("div");
    meta.className = "meta";

    const titleRow = document.createElement("div");
    titleRow.className = "title-row";

    const title = document.createElement("h2");
    title.className = "title";
    title.textContent = task.title || "Untitled task";

    const hearts = document.createElement("div");
    hearts.className = "hearts";
    hearts.textContent = heartString(task.hearts);

    titleRow.appendChild(title);
    titleRow.appendChild(hearts);
    meta.appendChild(titleRow);

    const action = document.createElement("div");
    action.className = "action";
    const statusNode =
      task.status === "todo"
        ? buildStatusNode(task.status, (event) => {
            updateTaskStatus(task.id, "pending_approval", event.currentTarget);
          })
        : buildStatusNode(task.status);

    action.appendChild(statusNode);

    card.appendChild(emoji);
    card.appendChild(meta);
    card.appendChild(action);

    tasksEl.appendChild(card);
  });
};

const calculateBalance = (tasks) =>
  tasks.reduce((total, task) => {
    if (task.status !== "approved") return total;
    const hearts = Number(task.hearts) || 0;
    return total + Math.max(0, hearts);
  }, 0);

const calculateNetBalance = (tasks, spentHearts) => {
  const earned = calculateBalance(tasks);
  const spent = Math.max(0, Number(spentHearts) || 0);
  return Math.max(0, earned - spent);
};

const fetchSpentHearts = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("id, variants ( products ( price ) )");
  if (error) {
    throw error;
  }
  return (data || []).reduce((total, order) => {
    const price = Number(order?.variants?.products?.price) || 0;
    return total + Math.max(0, price);
  }, 0);
};

const renderBalance = async (tasks) => {
  const targets = balanceEls.length ? balanceEls : fallbackBalanceEl ? [fallbackBalanceEl] : [];
  if (!targets.length) return;
  let total = calculateBalance(tasks);
  try {
    const spent = await fetchSpentHearts();
    total = calculateNetBalance(tasks, spent);
  } catch (error) {
    console.error("Supabase error:", error);
  }
  targets.forEach((el) => {
    el.textContent = total;
  });
};

const loadTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,hearts,emoji,status")
    .order("hearts", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  if (tasksEl) renderTasks(data);
  if (balanceEls.length || fallbackBalanceEl) {
    await renderBalance(data);
  }
};

if (tasksEl || balanceEls.length || fallbackBalanceEl) {
  loadTasks();
}

const renderProducts = (products) => {
  if (!productsEl) return;
  productsEl.innerHTML = "";
  if (!products.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No products available yet.";
    productsEl.appendChild(empty);
    return;
  }

  products.forEach((product) => {
    const link = document.createElement("a");
    link.className = "product-link";
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    link.setAttribute("aria-label", `View colors for ${product.product_name || "product"}`);

    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.image_url || "";
    image.alt = product.product_name || "Product image";
    image.loading = "lazy";

    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.product_name || "Unnamed product";

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = priceString(product.price);

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(price);
    link.appendChild(card);
    productsEl.appendChild(link);
  });
};

const loadProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id,product_name,price,image_url")
    .order("product_name", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  renderProducts(data);
};

if (productsEl) {
  loadProducts();
}

const getProductIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");
  if (!rawId) return null;
  const numericId = Number(rawId);
  return Number.isNaN(numericId) ? rawId : numericId;
};

const renderVariantEmpty = (message) => {
  if (!variantCarouselEl) return;
  variantCarouselEl.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = message;
  variantCarouselEl.appendChild(empty);
};

const renderVariantsGrid = (variants) => {
  if (!variantCarouselEl) return;
  variantCarouselEl.innerHTML = "";
  if (!variants.length) {
    renderVariantEmpty("No colors available for this product yet.");
    return;
  }

  variants.forEach((variant) => {
    const card = document.createElement("button");
    card.className = "product-card variant-card variant-button";
    card.type = "button";

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = variant.image_url || "";
    image.alt = variant.color ? `${variant.color} color` : "Color option";
    image.loading = "lazy";

    const label = document.createElement("h3");
    label.className = "product-name";
    label.textContent = variant.color || "Unnamed color";

    card.appendChild(image);
    card.appendChild(label);
    card.addEventListener("click", () => {
      openOrderModal(variant);
    });
    variantCarouselEl.appendChild(card);
  });
};

const setOrderMessage = (
  message,
  includeEarnLink = false,
  isError = false,
  isSuccess = false
) => {
  if (!orderModalMessageEl) return;
  if (!message) {
    orderModalMessageEl.textContent = "";
    orderModalMessageEl.classList.remove("is-error");
    orderModalMessageEl.classList.remove("is-success");
    return;
  }
  orderModalMessageEl.classList.toggle("is-error", isError);
  orderModalMessageEl.classList.toggle("is-success", isSuccess);
  const needsHtml = includeEarnLink || message.includes("<br>");
  if (needsHtml) {
    const safeMessage = includeEarnLink
      ? message.replace("tasks", '<a href="index.html">tasks</a>')
      : message;
    orderModalMessageEl.innerHTML = safeMessage;
    return;
  }
  orderModalMessageEl.textContent = message;
};

const openOrderModal = (variant) => {
  if (!orderModalEl || !orderModalOverlayEl || !currentProduct) return;
  currentVariant = variant;
  if (orderModalImageEl) {
    orderModalImageEl.src = variant.image_url || currentProduct.image_url || "";
    orderModalImageEl.alt = variant.color ? `${variant.color} color` : "Product color";
  }
  if (orderModalTitleEl) {
    orderModalTitleEl.textContent = currentProduct.product_name || "Product";
  }
  if (orderModalSubtitleEl) {
    orderModalSubtitleEl.textContent = variant.color ? `Color: ${variant.color}` : "Color option";
  }
  if (orderModalPriceEl) {
    orderModalPriceEl.textContent = priceString(currentProduct.price);
  }
  if (orderModalOrderEl) {
    orderModalOrderEl.disabled = false;
    orderModalOrderEl.textContent = "Order";
  }
  setOrderMessage("");
  orderModalEl.hidden = false;
  orderModalOverlayEl.hidden = false;
  orderModalOverlayEl.classList.add("is-visible");
};

const closeOrderModal = () => {
  if (!orderModalEl || !orderModalOverlayEl) return;
  orderModalEl.hidden = true;
  orderModalOverlayEl.hidden = true;
  orderModalOverlayEl.classList.remove("is-visible");
  currentVariant = null;
  setOrderMessage("");
};

const fetchBalance = async () => {
  const { data, error } = await supabase.from("tasks").select("hearts,status");
  if (error) {
    throw error;
  }
  let spent = 0;
  try {
    spent = await fetchSpentHearts();
  } catch (spentError) {
    console.error("Supabase error:", spentError);
  }
  return calculateNetBalance(data || [], spent);
};

const handleOrder = async () => {
  if (!currentVariant || !currentProduct || !orderModalOrderEl) return;
  orderModalOrderEl.disabled = true;
  setOrderMessage("");
  const price = Math.max(0, Number(currentProduct.price) || 0);

  try {
    const balance = await fetchBalance();
    if (balance < price) {
      setOrderMessage(
        "Ooopsie! 😭 <br>Not enough ❤️ <br>You can earn ❤️ by doing tasks.",
        true,
        true
      );
      orderModalOrderEl.disabled = false;
      return;
    }

    const { error } = await supabase.from("orders").insert({ variant_id: currentVariant.id });
    if (error) {
      throw error;
    }

    setOrderMessage("Order placed! <br>Wait for your gift 😏", false, false, true);
    orderModalOrderEl.textContent = "Ordered!";
    await loadTasks();
  } catch (error) {
    console.error("Order error:", error);
    setOrderMessage("Unable to place order. Please try again.", false, true);
    orderModalOrderEl.disabled = false;
  }
};

const loadProductDetail = async () => {
  if (!productDetailEl) return;
  const productId = getProductIdFromUrl();
  if (!productId) {
    renderVariantEmpty("Missing product id.");
    return;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,product_name,price,image_url")
    .eq("id", productId)
    .single();

  if (productError) {
    console.error("Supabase error:", productError);
    renderVariantEmpty("Unable to load product details.");
    return;
  }
  currentProduct = product;

  if (productNameEl) {
    productNameEl.textContent = product?.product_name || "Product";
  }
  if (productPriceEl) {
    productPriceEl.textContent = priceString(product?.price);
  }

  const { data: variants, error: variantsError } = await supabase
    .from("variants")
    .select("id,color,image_url")
    .eq("product_id", productId)
    .order("color", { ascending: true });

  if (variantsError) {
    console.error("Supabase error:", variantsError);
    renderVariantEmpty("Unable to load colors for this product.");
    return;
  }

  renderVariantsGrid(variants || []);
};

if (productDetailEl) {
  loadProductDetail();
}

if (orderModalCloseEl) {
  orderModalCloseEl.addEventListener("click", closeOrderModal);
}
if (orderModalOverlayEl) {
  orderModalOverlayEl.addEventListener("click", closeOrderModal);
}
if (orderModalOrderEl) {
  orderModalOrderEl.addEventListener("click", handleOrder);
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && orderModalEl && !orderModalEl.hidden) {
    closeOrderModal();
  }
});
