import Icon from '@/components/app/Icon';
import { PropsWithChildren } from '@/types/PropsWithChildren';
import React from 'react';

interface Props extends PropsWithChildren {
  title?: string;
  counter?: number;
  slim?: boolean;
  icon?: string;
  loading?: boolean;
  onSubmit?: () => void;
  className?: string;
}

const Block = ({ title, counter, slim, icon, loading, onSubmit, children }: Props) => {
  return (
    <div className="rounded-none md:rounded-lg mb-4 bg-skin-block-bg h-full">
      {title && (
        <h4 className="px-4 pt-3 block bg-skin-header-bg lg:rounded-2xl" style={{ paddingBottom: '12px' }}>
          {title}
          {icon && (
            <a onClick={onSubmit} className="float-right text-color" style={{ paddingTop: '2px' }}>
              <Icon name={icon} size="22" />
            </a>
          )}
          <slot name="actions"></slot>
        </h4>
      )}
      {loading && (
        <div className="block px-4 py-4">
          <div className="bg-skin-text rounded-md animate-pulse-fast mb-2" style={{ width: '80%', height: '20px' }}></div>
          <div className="bg-skin-text rounded-md animate-pulse-fast" style={{ width: '50%', height: '20px' }}></div>
        </div>
      )}
      {!loading && <div className={`h-full leading-6${!slim ? ' p-4' : ''}`}>{children}</div>}
    </div>
  );
};

export default Block;
