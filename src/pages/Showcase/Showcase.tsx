import React, { useState } from 'react';
import { 
  Button, Input, Select, SearchBar, Badge, Modal, ConfirmationDialog, 
  Toast, Drawer, NotificationItem, BookCard, BookGrid, Sidebar,
  Pagination, DataTable, StatCard, ChartCard, EmptyState, LoadingState
} from '../../components/ui';

const Showcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [page, setPage] = useState(1);

  const sidebarItems = [
    { label: 'Dashboard', icon: 'fas fa-home', href: '#', isActive: true },
    { label: 'Library', icon: 'fas fa-book', href: '#' },
    { label: 'Members', icon: 'fas fa-users', href: '#' },
    { label: 'Settings', icon: 'fas fa-cog', href: '#' },
  ];

  const tableData = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'Available' },
    { id: 2, title: '1984', author: 'George Orwell', status: 'Checked Out' },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'Reserved' },
  ];

  const tableColumns = [
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: any) => (
        <Badge variant={item.status === 'Available' ? 'success' : item.status === 'Checked Out' ? 'error' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: 'var(--space-8)', backgroundColor: 'var(--bg-warm-cream)' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            <section>
              <h2>Typography & Colors</h2>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <div style={{ width: 50, height: 50, background: 'var(--bg-deep-black)' }}></div>
                <div style={{ width: 50, height: 50, background: 'var(--bg-warm-orange)' }}></div>
                <div style={{ width: 50, height: 50, background: 'var(--bg-soft-orange)' }}></div>
                <div style={{ width: 50, height: 50, background: 'var(--bg-pale-peach)' }}></div>
                <div style={{ width: 50, height: 50, background: 'var(--bg-warm-cream)', border: '1px solid var(--bg-border)' }}></div>
              </div>
            </section>
            <section>
              <h3>Buttons & Inputs</h3>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" icon="fas fa-plus">With Icon</Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', maxWidth: 600 }}>
                <Input label="Email Address" placeholder="hello@example.com" icon="fas fa-envelope" />
                <Select label="Category" options={[{ label: 'Fiction', value: 'fic' }]} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <SearchBar placeholder="Search books, authors, ISBN..." />
                </div>
              </div>
            </section>
            <section>
              <h3>Feedback & Overlays</h3>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                <Button onClick={() => setIsConfirmOpen(true)} variant="danger">Open Confirm</Button>
                <Button onClick={() => setShowToast(true)} variant="secondary">Show Toast</Button>
                <Button onClick={() => setIsDrawerOpen(true)}>Open Drawer</Button>
              </div>
            </section>
            <section>
              <h3>Data Display</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <StatCard title="Total Books" value="12,483" icon="fas fa-book" trend={{ value: 5.2, isPositive: true }} />
              </div>
              <ChartCard title="Circulation Trends" subtitle="Books checked out per month">
                <div style={{ color: 'var(--bg-secondary-text)' }}>Chart Placeholder</div>
              </ChartCard>
            </section>
            <section>
              <h3>Book Grid</h3>
              <BookGrid columns={4}>
                <BookCard id="1" title="Clean Code" author="Robert C. Martin" category="Programming" status="Checked Out" />
                <BookCard id="2" title="Sapiens" author="Yuval Noah Harari" category="History" status="Reserved" />
              </BookGrid>
            </section>
            <section>
              <h3>Data Table & Pagination</h3>
              <DataTable data={tableData} columns={tableColumns} />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
              </div>
            </section>
            <section>
              <h3>States</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <EmptyState title="No books found" description="Try adjusting your search criteria." actionLabel="Clear Filters" onAction={() => {}} />
                <div style={{ backgroundColor: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
                  <LoadingState />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Book">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Title" />
        </div>
      </Modal>

      <ConfirmationDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => {}} 
        title="Delete Book" 
        message="Are you sure?" 
        isDestructive 
      />

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Notifications">
        <NotificationItem title="New book request" description="John Doe requested 'Dune'" time="2 hours ago" isUnread />
      </Drawer>

      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        {showToast && <Toast message="Action completed successfully!" type="success" onClose={() => setShowToast(false)} />}
      </div>
    </div>
  );
};

export default Showcase;
