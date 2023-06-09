import { PropsWithChildren } from '@/types/PropsWithChildren';
import React from 'react';
import styled, { css } from 'styled-components';

const Tree = styled.ul`
  padding: 0px;
  margin: 0px;
  list-style: none;
  outline: 0px;
  flex-grow: 1;
  overflow-y: auto;

  .treeItem {
    list-style: none;
    margin: 0;
    padding: 0;
    outline: 0;
  }

  .itemContent {
    padding-top: 2px;
    padding-bottom: 2px;
    width: 100%;
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
  }

  .iconContainer {
    margin-right: 4px;
    width: 15px;
    display: flex;
    flex-shrink: 0;
    justify-content: center;

    span:after {
      content: '';
      display: inline-block;
      width: 10px;
      height: 10px;
      transform: rotate(135deg);
      transition: transform 0.3s;
      border-left: 2px solid;
      border-bottom: 2px solid;
      border-color: var(--text-color);
    }

    &.iconCollapse {
      span:after {
        transform: rotate(-45deg);
      }
    }
  }

  .itemLabel {
    width: 100%;
    min-width: 0;
    padding-left: 4px;
    position: relative;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    letter-spacing: 0.00938em;
  }

  .treeItemGroup {
    height: auto;
    padding: 0;
    margin: 0 0 0 17px;
    transition: max-height 0.3s, transform 0.3s;
    transform-origin: top;
    overflow: hidden;
    transform: scaleY(1);

    &.collapse {
      max-height: 0;
      transform: scaleY(0);
    }
  }

  .collapseWrapper {
    display: flex;
    width: 100%;
  }
`;

export default function TreeView(props: PropsWithChildren) {
  return <Tree>{props.children}</Tree>;
}
