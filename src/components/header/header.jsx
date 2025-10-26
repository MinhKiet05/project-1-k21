import './header.css';

export function Header() {
  return (
    <header className="header">
      <h1>NoTungPhoCo Marketplace</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
