import React, { useState } from "react";
import "./Management.css";

export default function Manager() {
  const [status, setStatus] = useState("Đã duyệt");

  const posts = [
    {
      title: "Tiêu đề",
      description: "Mô tả",
      price: "0vnđ",
      image: "#",
      status: "Đã bán",
      subStatus: "Chưa bán được",
      approved: true,
      rejected: false,
    },
    {
      title: "Tiêu đề",
      description: "Mô tả",
      price: "0vnđ",
      image: "#",
      status: "Đã bán",
      subStatus: "Chưa bán được",
      approved: true,
      rejected: false,
    },
    {
      title: "Tiêu đề",
      description: "Mô tả",
      price: "0vnđ",
      image: "#",
      status: "Không được duyệt",
      subStatus: "",
      approved: false,
      rejected: true,
    },
    {
      title: "Tiêu đề",
      description: "Mô tả",
      price: "0vnđ",
      image: "#",
      status: "Chưa duyệt",
      subStatus: "",
      approved: false,
      rejected: false,
    },
  ];

  return (
    <div className="manager-container">
      <h2 className="manager-title">Quản lý các bài đăng</h2>

      <div className="manager-filter">
        <label>Trạng thái</label>
        <div className="select-wrapper">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="manager-select"
          >
            <option>Đã duyệt</option>
            <option>Chưa duyệt</option>
            <option>Không được duyệt</option>
          </select>
</div>

      </div>

      <table className="manager-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Mô tả sản phẩm</th>
            <th>Giá tiền</th>
            <th>Ảnh</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={index}>
              <td>{post.title}</td>
              <td>{post.description}</td>
              <td>{post.price}</td>
              <td>
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="manager-img"
                  />
                ) : (
                  <div className="manager-img-placeholder">---</div>
                )}
              </td>
              <td>
                {post.rejected ? (
                  <p className="status-rejected">{post.status}</p>
                ) : post.approved ? (
                  <>
                    <span className="status-sold">{post.status}</span>
                    <p className="status-sub">{post.subStatus}</p>
                  </>
                ) : (
                  <p className="status-pending">{post.status}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
