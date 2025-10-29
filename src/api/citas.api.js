const res = await fetch(`${import.meta.env.VITE_API_URL}/citas`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify(nuevaCita),
});
