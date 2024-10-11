import React, { useEffect, useState } from "react";
import axios from "axios";

interface data {
  name: string;
  id: number;
  description: string;
}

const ExampleComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/example/")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div>
      <h1>Example Data</h1>
      <ul>
        {data.map((item: data) => (
          <li key={item.id}>
            {item.name}: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;
