import React from 'react';
import { Tag, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { useNavigation } from '../context/NavigationContext';

interface MemoryItemMock {
  id: string;
  rawText: string;
  createdAt: string;
  merchant?: string;
  price?: number;
  currency?: string;
  tags: string[];
}

interface TimelineItemProps {
  item: MemoryItemMock;
}

export function TimelineItem({ item }: TimelineItemProps) {
  const { navigateTo } = useNavigation();

  // Format date helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Parse display title by stripping merchant/tags for a clean interface
  const getDisplayTitle = () => {
    let cleanText = item.rawText;
    
    // Remove hashtags
    cleanText = cleanText.replace(/#\S+/g, '');
    // Remove merchant tokens
    cleanText = cleanText.replace(/@\S+/g, '');
    // Remove dollar price tags
    cleanText = cleanText.replace(/\$\d+(\.\d{2})?/g, '');
    
    return cleanText.trim() || 'Untitled Purchase';
  };

  return (
    <Card
      hoverable
      onClick={() => navigateTo('details', item.id)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-16)',
        width: '100%',
        padding: 'var(--space-16)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', flexGrow: 1, minWidth: 0 }}>
        {/* Title */}
        <h3 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {getDisplayTitle()}
        </h3>

        {/* Subtitle details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-16)', color: 'var(--text-secondary)' }}>
          {item.merchant && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-12)' }}>
              <ShoppingBag size={12} /> {item.merchant}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-12)' }}>
            <Calendar size={12} /> {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Tag chips */}
        {item.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', marginTop: '4px' }}>
            {item.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: 'var(--font-12)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Price and Navigation arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
        {item.price !== undefined && (
          <span
            className="text-16 font-mono"
            style={{
              fontWeight: 600,
              color: 'var(--primary)',
              padding: 'var(--space-8) var(--space-12)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-8)'
            }}
          >
            ${item.price.toFixed(2)}
          </span>
        )}
        <ArrowRight size={18} style={{ color: 'var(--border)' }} />
      </div>
    </Card>
  );
}
