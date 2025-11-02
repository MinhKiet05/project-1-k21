import './AdminManagement.css';
export default function AdminSidebarManagement() {
  return (
    <div>
        <h1>Admin</h1>
        <ul>
              <li><a href="/dashboard/users">Người dùng</a></li>
              <li><a href="/dashboard/posts">Bài viết</a></li>
        </ul>
    </div>
  );
}
