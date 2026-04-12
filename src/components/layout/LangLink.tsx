import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useLanguage } from '../../i18n';

/**
 * Language-aware Link wrapper.
 * Automatically prepends /:lang/ prefix to all `to` paths.
 * Usage: <LangLink to="/tools">Tools</LangLink>  →  /en/tools or /tr/tools
 */
export function LangLink({ to, ...props }: LinkProps) {
  const { localePath } = useLanguage();

  const localizedTo =
    typeof to === 'string' ? localePath(to) : to;

  return <Link to={localizedTo} {...props} />;
}
