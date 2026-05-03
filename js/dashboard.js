// 📦 جلب البيانات
const products = JSON.parse(localStorage.getItem("products")) || [];
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 🔢 حساب الإحصائيات
function calculateStats() {
    let revenue = 0;
    let orders = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);

        if (product) {
            revenue += product.price * item.qty;
            orders += item.qty;
        }
    });

    const customers = Math.floor(orders * 0.5);
    const avg = orders ? revenue / orders : 0;

    return { revenue, orders, customers, avg };
}

// 📊 عرض البيانات
function renderDashboard() {
    const stats = calculateStats();

    document.getElementById("revenue").innerText = "$" + stats.revenue.toFixed(2);
    document.getElementById("orders").innerText = stats.orders;
    document.getElementById("customers").innerText = stats.customers;
    document.getElementById("avg").innerText = stats.avg.toFixed(2);
}

// 🚀 تشغيل
renderDashboard();


// 🎛️ sidebar toggle
const btn = document.getElementById("toggle-btn");
const sidebar = document.querySelector(".sidebar");

btn.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
});

// Charts of cards

const miniCharts = document.querySelectorAll(".mini-chart");

miniCharts.forEach(canvas => {
    new Chart(canvas, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [{
                data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100
                ],
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
});

const ctx = document.getElementById("twChart");
const filter = document.getElementById("twFilter");
const list = document.getElementById("twList");
const totalEl = document.getElementById("twTotal");
const loading = document.getElementById("twLoading");

let chart;
let activeIndex = null;

const COLORS = ["#6366f1","#22c55e","#f59e0b","#3b82f6"];

// 🔥 Simulated API
function fetchData(type) {
  return new Promise(res => {
    setTimeout(() => {
      const data = {
        week: [450,250,150,150],
        month: [1800,900,600,700],
        year: [12000,8000,4000,5000]
      };
      res(data[type]);
    }, 700);
  });
}

// 🎯 Animate number
function animate(el, value) {
  let start = 0;
  const step = value / 40;

  const i = setInterval(() => {
    start += step;
    if (start >= value) {
      start = value;
      clearInterval(i);
    }
    el.innerText = Math.floor(start);
  }, 16);
}

// 📊 Render
async function render(type) {
  loading.classList.remove("hidden");
  list.innerHTML = "";

  const data = await fetchData(type);
  loading.classList.add("hidden");

  if (!data) return;

  const labels = ["Google","Facebook","Direct","Instagram"];
  const total = data.reduce((a,b)=>a+b,0);

  animate(totalEl, total);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: COLORS,
        borderWidth: 0,
        hoverOffset: 14
      }]
    },
    options: {
      cutout: "70%",
      animation: {
        duration: 900,
        easing: "easeInOutQuart"
      },
      plugins: { legend: { display: false } }
    }
  });

  // Build list
  labels.forEach((label, i) => {
    const val = data[i];
    const percent = ((val / total) * 100).toFixed(0);

    const el = document.createElement("div");
    el.className = "tw-item";

    el.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center">
        <div class="tw-dot" style="background:${COLORS[i]}"></div>
        ${label}
      </div>
      <div>
        <strong>${percent}%</strong>
        <small style="color:#94a3b8">(${val})</small>
      </div>
    `;

    // 🔥 Hover sync
    el.addEventListener("mouseenter", () => {
      chart.setActiveElements([{datasetIndex:0,index:i}]);
      chart.update();
    });

    el.addEventListener("mouseleave", () => {
      if (activeIndex === null) {
        chart.setActiveElements([]);
        chart.update();
      }
    });

    // 🚀 Click isolate (ميزة احترافية)
    el.addEventListener("click", () => {
      activeIndex = i;

      document.querySelectorAll(".tw-item").forEach(x=>x.classList.remove("active"));
      el.classList.add("active");

      chart.setActiveElements([{datasetIndex:0,index:i}]);
      chart.update();
    });

    list.appendChild(el);
  });
}

// 🔁 Filter
filter.addEventListener("change", e => {
  activeIndex = null;
  render(e.target.value);
});

// 🚀 Init
render("week");