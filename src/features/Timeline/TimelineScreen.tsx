import React, { useState } from 'react';
import { Search, Tag, X, HelpCircle, Archive } from 'lucide-react';
import { TimelineItem } from '../../components/TimelineItem';
import { EmptyState } from '../../components/EmptyState';
import { Card } from '../../components/Card';
import { MOCK_MEMORIES, MOCK_RECENT_TAGS } from '../mockData';

export function TimelineScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter mock memories locally for demonstration
  const filteredMemories = MOCK_MEMORIES.filter((item) => {
    const matchesSearch =
      item.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTag = selectedTag ? item.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      {/* Title */}
      <div>
        <h1 className="text-28" style={{ fontWeight: 700 }}>Timeline</h1>
        <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
          Browse your chronological memory timeline
        </p>
      </div>

      {/* Filters bar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        {/* Search inside list */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search within history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px 0 36px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-8)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-14)',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tag chips selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          {MOCK_RECENT_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: '4px 10px',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-8)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: 'var(--font-12)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-speed), color var(--transition-speed)'
                }}
              >
                <Tag size={10} />
                #{tag}
              </button>
            );
          })}
        </div>
      </section>

      {/* Timeline entries list */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {filteredMemories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {filteredMemories.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Archive size={32} />}
            title="No matches found"
            description="Adjust your search terms or filter tags to retrieve details."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
          />
        )}
      </section>
    </div>
  );
}

