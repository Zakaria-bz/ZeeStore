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

const ctx = document.getElementById("trafficChart");

new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Google", "Facebook", "Direct", "Instagram"],
    datasets: [{
      data: [45, 25, 15, 15],
      backgroundColor: [
        "#6366f1",
        "#22c55e",
        "#f59e0b",
        "#3b82f6"
      ],
      borderWidth: 0
    }]
  },
  options: {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5e1"
        }
      }
    }
  }
});