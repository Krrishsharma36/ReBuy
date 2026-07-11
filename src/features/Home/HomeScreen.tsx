import React, { useState } from 'react';
import { Plus, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { SearchInput } from '../../components/SearchInput';
import { TimelineItem } from '../../components/TimelineItem';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Card } from '../../components/Card';
import { MOCK_MEMORIES, MOCK_RECENT_TAGS } from '../mockData';

export function HomeScreen() {
  const { navigateTo } = useNavigation();
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');

  const handleQuickSave = () => {
    if (!query.trim()) return;
    // Just a placeholder alert since business logic is off-limits for Prompt 02
    alert(`Mock Parser Input: "${query}"\nIn Prompt 03, this will be saved to IndexedDB.`);
    setQuery('');
  };

  const handleModalSave = () => {
    if (!modalText.trim()) return;
    alert(`Mock Parser Input: "${modalText}"\nIn Prompt 03, this will be saved to IndexedDB.`);
    setModalText('');
    setIsModalOpen(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      {/* Search Input Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          onSubmit={handleQuickSave}
          placeholder="What do you want to remember?"
        />

        {query.trim() && (
          <div
            className="animate-fade-in"
            onClick={handleQuickSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-12) var(--space-16)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-12)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-speed)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span className="text-12" style={{ color: 'var(--text-secondary)' }}>
                Press <kbd style={{ padding: '2px 4px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '4px' }}>Enter</kbd> to parse and save this memory
              </span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
      </section>

      {/* Recently Used Tags */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recently Used Tags
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          {MOCK_RECENT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(`#${tag} `);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                padding: 'var(--space-8) var(--space-12)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--font-12)',
                transition: 'background-color var(--transition-speed)'
              }}
            >
              <Tag size={12} style={{ color: 'var(--text-secondary)' }} />
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity stream */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Activity
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigateTo('timeline')}>
            View All
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {MOCK_MEMORIES.slice(0, 3).map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Create new memory note"
        style={{
          position: 'fixed',
          bottom: 'var(--space-32)',
          right: 'var(--space-32)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'transform var(--transition-speed) var(--transition-ease), background-color var(--transition-speed)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={24} />
      </button>

      {/* Fast Input Modal overlay */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Remember Something"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleModalSave} disabled={!modalText.trim()}>
              Save Memory
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
            Type any line. ReBuy will extract prices, merchants, dates, and tag markers.
          </p>
          <textarea
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
            placeholder="e.g. Costco tire rotation $120 #car-service"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'var(--space-12)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-12)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-16)',
              outline: 'none',
              fontFamily: 'var(--font-family)',
              resize: 'none'
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

