'use client';

import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  ContainerOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  DownOutlined,
  CheckOutlined,
  DiffOutlined,
  FundOutlined,
  FileTextOutlined,
  FormOutlined,
  HistoryOutlined,
  InteractionOutlined,
  LeftOutlined,
  LogoutOutlined,
  NotificationOutlined,
  PartitionOutlined,
  ProfileOutlined,
  RadarChartOutlined,
  ReconciliationOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TableOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import viVN from 'antd/locale/vi_VN';
import {
  Avatar,
  App,
  Badge,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Popover,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AppProvider, useAppContext } from '@/components/providers/app-provider';
import { defaultLocale, localeLabels, type Dictionary, type Locale } from '@/lib/i18n';

const antdLocaleMap = {
  'en-US': enUS,
  'vi-VN': viVN,
  'ja-JP': jaJP,
};

const themeSwatches = ['#1677ff', '#eb2f96', '#fa541c', '#faad14', '#13c2c2', '#52c41a', '#2f54eb', '#722ed1'];
const SHELL_SETTINGS_STORAGE_KEY = 'admin-pro-shell-settings';
const localeFlags: Record<Locale, string> = {
  'en-US': '🇺🇸',
  'vi-VN': '🇻🇳',
  'ja-JP': '🇯🇵',
};

type ShellSettings = {
  collapsed: boolean;
  primaryColor: string;
  fixedHeader: boolean;
  fixedSidebar: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showMenu: boolean;
  showMenuHeader: boolean;
  contentWidth: 'fluid' | 'fixed';
  darkPageStyle: boolean;
  navigationMode: 'side' | 'top' | 'mix';
  splitMenus: boolean;
};

function renderLocaleLabel(locale: Locale) {
  return (
    <span className="app-locale-option">
      <span className="app-locale-option__flag" aria-hidden="true">
        {localeFlags[locale]}
      </span>
      <span>{localeLabels[locale]}</span>
    </span>
  );
}

function ShellMenuItem({
  active,
  open,
  collapsed,
  icon,
  label,
  onClick,
  popup,
}: {
  active: boolean;
  open: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  popup?: React.ReactNode;
}) {
  const item = (
    <button
      className={`app-sidebar__item${active ? ' is-active' : ''}${open ? ' is-open' : ''}`}
      type="button"
      aria-expanded={open}
      onClick={onClick}
    >
      <span className="app-sidebar__item-icon">{icon}</span>
      <span className="app-sidebar__item-label">{label}</span>
      <DownOutlined className={`app-sidebar__item-chevron${open ? ' is-active' : ''}`} />
    </button>
  );

  if (!collapsed) {
    return item;
  }

  if (popup) {
    return (
      <Popover
        arrow={{ pointAtCenter: true }}
        content={popup}
        overlayClassName="app-sidebar__submenu-popover"
        placement="rightTop"
        trigger={['hover', 'click']}
      >
        {item}
      </Popover>
    );
  }

  return (
    <Tooltip placement="right" title={label}>
      {item}
    </Tooltip>
  );
}

function SidebarSubmenuItem({
  active,
  href,
  label,
  popup,
  icon,
}: {
  active: boolean;
  href?: string;
  label: string;
  popup?: boolean;
  icon?: React.ReactNode;
}) {
  if (href) {
    return (
      <Link className={`app-sidebar__submenu-item${active ? ' is-active' : ''}${popup ? ' is-popup' : ''}`} href={href}>
        {icon ? <span className="app-sidebar__submenu-item-icon">{icon}</span> : null}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <span className={`app-sidebar__submenu-item${active ? ' is-active' : ''}${popup ? ' is-popup' : ''}`}>
      {icon ? <span className="app-sidebar__submenu-item-icon">{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
}

function AppShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dictionary, locale } = useAppContext();
  const isLoginPage = pathname.endsWith('/user/login');
  const currentSection = pathname.split('/').slice(2, 3)[0] ?? 'welcome';
  const currentSectionGroup =
    currentSection === 'welcome' || currentSection === 'monitor' || currentSection === 'workspace'
      ? 'dashboard'
      : currentSection;
  const [currentHash, setCurrentHash] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#1677ff');
  const [fixedHeader, setFixedHeader] = useState(false);
  const [fixedSidebar, setFixedSidebar] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const [showMenuHeader, setShowMenuHeader] = useState(true);
  const [contentWidth, setContentWidth] = useState<'fluid' | 'fixed'>('fluid');
  const [darkPageStyle, setDarkPageStyle] = useState(true);
  const [navigationMode, setNavigationMode] = useState<'side' | 'top' | 'mix'>('side');
  const [splitMenus, setSplitMenus] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(currentSectionGroup);
  const localeOptions = (['en-US', 'vi-VN', 'ja-JP'] as const).map((value) => ({
    label: renderLocaleLabel(value),
    value,
  }));

  useEffect(() => {
    const rawSettings = window.localStorage.getItem(SHELL_SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return;
    }

    try {
      const parsed = JSON.parse(rawSettings) as Partial<ShellSettings>;

      if (typeof parsed.collapsed === 'boolean') {
        setCollapsed(parsed.collapsed);
      }
      if (typeof parsed.primaryColor === 'string' && themeSwatches.includes(parsed.primaryColor)) {
        setPrimaryColor(parsed.primaryColor);
      }
      if (typeof parsed.fixedHeader === 'boolean') {
        setFixedHeader(parsed.fixedHeader);
      }
      if (typeof parsed.fixedSidebar === 'boolean') {
        setFixedSidebar(parsed.fixedSidebar);
      }
      if (typeof parsed.showHeader === 'boolean') {
        setShowHeader(parsed.showHeader);
      }
      if (typeof parsed.showFooter === 'boolean') {
        setShowFooter(parsed.showFooter);
      }
      if (typeof parsed.showMenu === 'boolean') {
        setShowMenu(parsed.showMenu);
      }
      if (typeof parsed.showMenuHeader === 'boolean') {
        setShowMenuHeader(parsed.showMenuHeader);
      }
      if (parsed.contentWidth === 'fluid' || parsed.contentWidth === 'fixed') {
        setContentWidth(parsed.contentWidth);
      }
      if (typeof parsed.darkPageStyle === 'boolean') {
        setDarkPageStyle(parsed.darkPageStyle);
      }
      if (parsed.navigationMode === 'side' || parsed.navigationMode === 'top' || parsed.navigationMode === 'mix') {
        setNavigationMode(parsed.navigationMode);
      }
      if (typeof parsed.splitMenus === 'boolean') {
        setSplitMenus(parsed.splitMenus);
      }
    } catch {
      window.localStorage.removeItem(SHELL_SETTINGS_STORAGE_KEY);
    }

    setSettingsHydrated(true);
  }, []);

  useEffect(() => {
    setOpenSection(currentSectionGroup);
  }, [currentSectionGroup]);

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash || '');
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    if (!settingsHydrated) {
      return;
    }

    const settings: ShellSettings = {
      collapsed,
      primaryColor,
      fixedHeader,
      fixedSidebar,
      showHeader,
      showFooter,
      showMenu,
      showMenuHeader,
      contentWidth,
      darkPageStyle,
      navigationMode,
      splitMenus,
    };

    window.localStorage.setItem(SHELL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [
    settingsHydrated,
    collapsed,
    primaryColor,
    fixedHeader,
    fixedSidebar,
    showHeader,
    showFooter,
    showMenu,
    showMenuHeader,
    contentWidth,
    darkPageStyle,
    navigationMode,
    splitMenus,
  ]);

  const notificationItems = [
    {
      key: 'approval',
      label: <span>{dictionary.header.notifications.approval}</span>,
    },
    {
      key: 'deployment',
      label: <span>{dictionary.header.notifications.deployment}</span>,
    },
    {
      key: 'system',
      label: <span>{dictionary.header.notifications.system}</span>,
    },
  ];

  const userItems = [
    {
      key: 'profile',
      label: <Link href={`/${locale}/admin`}>{dictionary.header.user.profile}</Link>,
    },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: dictionary.header.signOut,
    },
  ];

  const goToLocale = (nextLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.replace(segments.join('/') || `/${nextLocale}`);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'signout') {
      router.replace(`/${locale}/user/login`);
    }
  };

  const sidebarUserCard = (
    <div className="app-sidebar__user-card">
      <div className="app-sidebar__user-card-header">
        <Avatar className="app-sidebar__user-card-avatar" icon={<UserOutlined />} size={32} />
        <span className="app-sidebar__user-card-name">{dictionary.header.user.name}</span>
      </div>
      <Link className="app-sidebar__user-card-action" href={`/${locale}/admin`}>
        {dictionary.header.user.profile}
      </Link>
      <button
        className="app-sidebar__user-card-action"
        type="button"
        onClick={() => router.replace(`/${locale}/user/login`)}
      >
        <LogoutOutlined />
        <span>{dictionary.header.signOut}</span>
      </button>
    </div>
  );

  const sidebarSections = [
    {
      key: 'dashboard',
      href: `/${locale}/welcome`,
      icon: <DashboardOutlined />,
      label: dictionary.shell.primary.dashboard,
      match: ['welcome', 'monitor', 'workspace'],
      children: [
        { label: dictionary.shell.secondary.analytics, href: `/${locale}/welcome`, icon: <BarChartOutlined /> },
        { label: dictionary.shell.secondary.monitor, href: `/${locale}/monitor`, icon: <RadarChartOutlined /> },
        { label: dictionary.shell.secondary.workspace, href: `/${locale}/workplace`, icon: <FundOutlined /> },
      ],
    },
    {
      key: 'form',
      href: `/${locale}/form`,
      icon: <FormOutlined />,
      label: dictionary.shell.primary.form,
      children: [
        { label: dictionary.shell.secondary.customerProfile, href: `/${locale}/form`, icon: <ProfileOutlined /> },
        { label: dictionary.shell.secondary.businessRegistration, href: `/${locale}/form#business`, icon: <ClusterOutlined /> },
        { label: dictionary.shell.secondary.deliverySetup, href: `/${locale}/form#delivery`, icon: <ShoppingCartOutlined /> },
        { label: dictionary.shell.secondary.verification, href: `/${locale}/form#verification`, icon: <SafetyCertificateOutlined /> },
      ],
    },
    {
      key: 'components',
      href: `/${locale}/components`,
      icon: <AppstoreOutlined />,
      label: dictionary.shell.primary.components,
      children: [
        { label: dictionary.shell.secondary.controls, href: `/${locale}/components`, icon: <InteractionOutlined /> },
        { label: dictionary.shell.secondary.selection, href: `/${locale}/components#selection`, icon: <CheckCircleOutlined /> },
        { label: dictionary.shell.secondary.feedbackKit, href: `/${locale}/components#feedback`, icon: <NotificationOutlined /> },
        { label: dictionary.shell.secondary.dataDisplay, href: `/${locale}/components#display`, icon: <TableOutlined /> },
      ],
    },
    {
      key: 'categories',
      href: `/${locale}/categories`,
      icon: <AppstoreOutlined />,
      label: dictionary.shell.primary.categories,
      children: [
        { label: dictionary.shell.secondary.categoryList, href: `/${locale}/categories`, icon: <UnorderedListOutlined /> },
        { label: dictionary.shell.secondary.taxonomy, href: `/${locale}/categories#taxonomy`, icon: <PartitionOutlined /> },
        { label: dictionary.shell.secondary.attributes, href: `/${locale}/categories#attributes`, icon: <AppstoreOutlined /> },
      ],
    },
    {
      key: 'products',
      href: `/${locale}/products`,
      icon: <ShoppingOutlined />,
      label: dictionary.shell.primary.products,
      children: [
        { label: dictionary.shell.secondary.productList, href: `/${locale}/products`, icon: <ShoppingCartOutlined /> },
        { label: dictionary.shell.secondary.inventory, href: `/${locale}/products#inventory`, icon: <DeploymentUnitOutlined /> },
        { label: dictionary.shell.secondary.pricing, href: `/${locale}/products#pricing`, icon: <FundOutlined /> },
      ],
    },
    {
      key: 'orders',
      href: `/${locale}/orders`,
      icon: <ContainerOutlined />,
      label: dictionary.shell.primary.orders,
      children: [
        { label: dictionary.shell.secondary.orderList, href: `/${locale}/orders`, icon: <ReconciliationOutlined /> },
        { label: dictionary.shell.secondary.fulfillment, href: `/${locale}/orders#fulfillment`, icon: <DeploymentUnitOutlined /> },
        { label: dictionary.shell.secondary.paymentsHub, href: `/${locale}/orders#payments`, icon: <AuditOutlined /> },
      ],
    },
    {
      key: 'users',
      href: `/${locale}/users`,
      icon: <TeamOutlined />,
      label: dictionary.shell.primary.users,
      children: [
        { label: dictionary.shell.secondary.userList, href: `/${locale}/users`, icon: <TeamOutlined /> },
        { label: dictionary.shell.secondary.userRoles, href: `/${locale}/users#roles`, icon: <SolutionOutlined /> },
        { label: dictionary.shell.secondary.userActivity, href: `/${locale}/users#activity`, icon: <HistoryOutlined /> },
      ],
    },
    {
      key: 'permissions',
      href: `/${locale}/permissions`,
      icon: <SafetyCertificateOutlined />,
      label: dictionary.shell.primary.permissions,
      children: [
        { label: dictionary.shell.secondary.permissionList, href: `/${locale}/permissions`, icon: <SafetyCertificateOutlined /> },
        { label: dictionary.shell.secondary.permissionScope, href: `/${locale}/permissions#scopes`, icon: <ClusterOutlined /> },
        { label: dictionary.shell.secondary.permissionAudit, href: `/${locale}/permissions#audit`, icon: <AuditOutlined /> },
      ],
    },
    {
      key: 'list',
      href: `/${locale}/list`,
      icon: <TableOutlined />,
      label: dictionary.shell.primary.list,
      children: [
        { label: dictionary.shell.secondary.rules, href: `/${locale}/list`, icon: <TableOutlined /> },
        { label: dictionary.shell.secondary.approvals, href: `/${locale}/list#approvals`, icon: <AuditOutlined /> },
        { label: dictionary.shell.secondary.logs, href: `/${locale}/list#logs`, icon: <FileTextOutlined /> },
      ],
    },
    {
      key: 'profile',
      href: `/${locale}/admin#profile`,
      icon: <FileTextOutlined />,
      label: dictionary.shell.primary.profile,
      children: [
        { label: dictionary.shell.secondary.overview, href: `/${locale}/admin#overview`, icon: <ProfileOutlined /> },
        { label: dictionary.shell.secondary.basic, href: `/${locale}/admin#basic-profile`, icon: <UserOutlined /> },
        { label: dictionary.shell.secondary.security, href: `/${locale}/admin#profile-security`, icon: <SafetyCertificateOutlined /> },
      ],
    },
    {
      key: 'result',
      href: `/${locale}/welcome#result`,
      icon: <CheckCircleOutlined />,
      label: dictionary.shell.primary.result,
      children: [
        { label: dictionary.shell.secondary.overview, href: `/${locale}/welcome#overview`, icon: <CheckCircleOutlined /> },
        { label: dictionary.shell.secondary.approvals, href: `/${locale}/welcome#approvals`, icon: <AuditOutlined /> },
        { label: dictionary.shell.secondary.logs, href: `/${locale}/welcome#logs`, icon: <FileTextOutlined /> },
      ],
    },
    {
      key: 'exception',
      href: `/${locale}/list#exception`,
      icon: <WarningOutlined />,
      label: dictionary.shell.primary.exception,
      children: [
        { label: dictionary.shell.secondary.logs, href: `/${locale}/list#exception-logs`, icon: <DiffOutlined /> },
        { label: dictionary.shell.secondary.notification, href: `/${locale}/list#exception-notifications`, icon: <NotificationOutlined /> },
        { label: dictionary.shell.secondary.approvals, href: `/${locale}/list#exception-approvals`, icon: <AuditOutlined /> },
      ],
    },
    {
      key: 'account',
      href: `/${locale}/admin#account`,
      icon: <UserOutlined />,
      label: dictionary.shell.primary.account,
      children: [
        { label: dictionary.shell.secondary.basic, href: `/${locale}/admin#account-basic`, icon: <UserOutlined /> },
        { label: dictionary.shell.secondary.security, href: `/${locale}/admin#account-security`, icon: <SafetyCertificateOutlined /> },
        { label: dictionary.shell.secondary.binding, href: `/${locale}/admin#account-binding`, icon: <InteractionOutlined /> },
        { label: dictionary.shell.secondary.notification, href: `/${locale}/admin#account-notifications`, icon: <BellOutlined /> },
      ],
    },
  ] as const;

  const isChildRouteActive = useMemo(
    () => (href?: string) => {
      if (!href) {
        return false;
      }

      const [hrefPath, hrefHash = ''] = href.split('#');
      const normalizedHrefHash = hrefHash ? `#${hrefHash}` : '';

      if (normalizedHrefHash) {
        return pathname === hrefPath && currentHash === normalizedHrefHash;
      }

      return pathname === hrefPath && currentHash === '';
    },
    [currentHash, pathname],
  );

  const isSectionChildActive = (sectionKey: string, sectionActive: boolean, childIndex: number) => {
    if (sectionKey === 'dashboard') {
      return (
        (currentSection === 'welcome' && childIndex === 0) ||
        (currentSection === 'monitor' && childIndex === 1) ||
        (currentSection === 'workspace' && childIndex === 2)
      );
    }

    return sectionActive && childIndex === 0;
  };

  if (isLoginPage) {
    return (
      <div>
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
          <Select
            aria-label={dictionary.header.language}
            options={localeOptions}
            value={locale}
            onChange={(value) => goToLocale(value)}
          />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`app-dashboard-shell${collapsed ? ' is-sidebar-collapsed' : ''}${showHeader ? '' : ' is-header-hidden'}${showFooter ? '' : ' is-footer-hidden'}${contentWidth === 'fixed' ? ' is-content-fixed' : ''}${darkPageStyle ? ' is-page-style-dark' : ' is-page-style-light'}${fixedSidebar ? ' is-sidebar-fixed' : ''}${fixedHeader ? ' is-header-fixed' : ''}`}
      style={{ ['--app-primary' as string]: primaryColor }}
    >
      {showMenu ? (
        <aside className={`app-sidebar${collapsed ? ' is-collapsed' : ''}${fixedSidebar ? ' is-fixed' : ''}`}>
          <button
            className={`app-sidebar__switch${collapsed ? ' is-collapsed' : ''}`}
            type="button"
            aria-label={collapsed ? dictionary.shell.expand : dictionary.shell.collapse}
            onClick={() => setCollapsed((value) => !value)}
          >
            <LeftOutlined className={collapsed ? 'app-sidebar__collapse-icon is-collapsed' : 'app-sidebar__collapse-icon'} />
          </button>

          {showMenuHeader ? (
            <div className="app-sidebar__brand">
              <div className="app-sidebar__brand-main">
                <Image alt="Admin Pro" height={28} src="/logo.svg" width={28} />
                <span className="app-sidebar__brand-text">Admin Pro</span>
              </div>
            </div>
          ) : (
            <div className="app-sidebar__brand app-sidebar__brand--compact">
              <div className="app-sidebar__brand-main">
                <Image alt="Admin Pro" height={28} src="/logo.svg" width={28} />
              </div>
            </div>
          )}

          <div className="app-sidebar__scroll">
            <nav className="app-sidebar__menu">
              {sidebarSections.map((section) => {
                const sectionMatches = 'match' in section ? section.match : [section.key];
                const isActive = sectionMatches.includes(currentSection as never);
                const activeChildIndex = section.children.findIndex((child) => isChildRouteActive(child.href));
                const isOpen = openSection === section.key;
                const isSectionActive = isActive || activeChildIndex >= 0 || isOpen;

                return (
                  <div key={section.key} className="app-sidebar__group">
                    <ShellMenuItem
                      active={isSectionActive}
                      collapsed={collapsed}
                      open={isOpen}
                      icon={section.icon}
                      label={section.label}
                      popup={
                        section.children.length ? (
                          <div className="app-sidebar__submenu-popup">
                            <Link className="app-sidebar__submenu-popup-title" href={section.href}>
                              {section.label}
                            </Link>
                            <div className="app-sidebar__submenu-popup-list">
                              {section.children.map((child, index) => (
                                <SidebarSubmenuItem
                                  key={`${section.key}-${child.label}-popup`}
                                  active={
                                    activeChildIndex >= 0
                                      ? activeChildIndex === index
                                      : isSectionChildActive(section.key, isActive, index)
                                  }
                                  href={child.href}
                                  icon={child.icon}
                                  label={child.label}
                                  popup
                                />
                              ))}
                            </div>
                          </div>
                        ) : undefined
                      }
                      onClick={() => {
                        if (collapsed) {
                          return;
                        }

                        setOpenSection((current) => (current === section.key ? null : section.key));
                      }}
                    />
                    <div className={`app-sidebar__submenu${isOpen && !collapsed ? ' is-open' : ''}`}>
                      {section.children.map((child, index) => (
                        <SidebarSubmenuItem
                          key={`${section.key}-${child.label}`}
                          active={
                            activeChildIndex >= 0
                              ? activeChildIndex === index
                              : isSectionChildActive(section.key, isActive, index)
                          }
                          href={child.href}
                          icon={child.icon}
                          label={child.label}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="app-sidebar__bottom">
            <div className={`app-sidebar__bottom-row${collapsed ? ' is-collapsed' : ''}`}>
              <Popover
                content={sidebarUserCard}
                overlayClassName="app-sidebar__user-popover"
                placement={collapsed ? 'top' : 'topLeft'}
                trigger="click"
              >
                <button className="app-sidebar__user" type="button" aria-label={dictionary.header.user.label}>
                  <Avatar className="app-sidebar__user-avatar" icon={<UserOutlined />} size={28} />
                  <span className="app-sidebar__user-name">{dictionary.header.user.name}</span>
                </button>
              </Popover>
              <div className="app-sidebar__tools">
                <Select
                  aria-label={dictionary.header.language}
                  className="app-sidebar__lang"
                  popupMatchSelectWidth={false}
                  options={localeOptions}
                  value={locale}
                  variant="borderless"
                  onChange={(value) => goToLocale(value)}
                />
              </div>
            </div>
          </div>
        </aside>
      ) : null}

      <main className="app-dashboard-main">
        <header className={`app-dashboard-main__toolbar${showHeader ? '' : ' is-hidden'}${fixedHeader ? ' is-fixed' : ''}`}>
          <div className="app-dashboard-main__toolbar-spacer" />
          <div className="app-dashboard-main__toolbar-actions">
            <Select
              aria-label={dictionary.header.language}
              className="app-dashboard-main__toolbar-language"
              options={localeOptions}
              value={locale}
              variant="borderless"
              onChange={(value) => goToLocale(value)}
            />
            <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click']}>
              <button
                className="app-dashboard-main__toolbar-icon"
                type="button"
                aria-label={dictionary.header.notifications.title}
              >
                <Badge count={3} size="small">
                  <BellOutlined />
                </Badge>
              </button>
            </Dropdown>
            <Dropdown menu={{ items: userItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={['click']}>
              <button className="app-dashboard-main__toolbar-user" type="button" aria-label={dictionary.header.user.label}>
                <Space size={10}>
                  <Avatar className="app-dashboard-main__toolbar-avatar" icon={<UserOutlined />} size={32} />
                  <span className="app-dashboard-main__toolbar-user-name">{dictionary.header.user.name}</span>
                </Space>
              </button>
            </Dropdown>
          </div>
        </header>
        <div className="app-dashboard-main__content">{children}</div>
        <footer className={`app-dashboard-main__footer${showFooter ? '' : ' is-hidden'}`}>
          <div>
            © 2026
            {' · '}
            Admin Pro
            {' · '}
            Nguyen Dong Phuong
            {' · '}
            <a href="mailto:phuongnd468@gmail.com">phuongnd468@gmail.com</a>
            {' · '}
            <a href="https://github.com/phuongnd468-svg/Dashboard-Admin-Pro" rel="noreferrer" target="_blank">
              GitHub
            </a>
          </div>
        </footer>
      </main>

      <button
        className="app-dashboard__setting-fab"
        type="button"
        aria-label="Settings"
        onClick={() => setSettingsOpen(true)}
      >
        <SettingOutlined />
      </button>

      <Drawer
        className="app-settings-drawer"
        closable={false}
        open={settingsOpen}
        title={dictionary.settingPanel.title}
        width={320}
        onClose={() => setSettingsOpen(false)}
      >
        <div className="app-settings-drawer__section">
          <div className="app-settings-drawer__label">{dictionary.settingPanel.pageStyle}</div>
          <div className="app-settings-drawer__option-row">
            <button
              className={`app-settings-preview${darkPageStyle ? ' is-active' : ''}`}
              type="button"
              onClick={() => setDarkPageStyle(true)}
            >
              <span className="app-settings-preview__chrome" />
              <span className="app-settings-preview__sider is-dark" />
              {darkPageStyle ? <CheckOutlined className="app-settings-preview__check" /> : null}
            </button>
            <button
              className={`app-settings-preview${!darkPageStyle ? ' is-active' : ''}`}
              type="button"
              onClick={() => setDarkPageStyle(false)}
            >
              <span className="app-settings-preview__chrome" />
              <span className="app-settings-preview__sider is-light" />
              {!darkPageStyle ? <CheckOutlined className="app-settings-preview__check" /> : null}
            </button>
          </div>
        </div>

        <div className="app-settings-drawer__section">
          <div className="app-settings-drawer__label">{dictionary.settingPanel.themeColor}</div>
          <div className="app-settings-drawer__swatches">
            {themeSwatches.map((color) => (
              <button
                key={color}
                className={`app-settings-swatch${primaryColor === color ? ' is-active' : ''}`}
                style={{ background: color }}
                type="button"
                onClick={() => setPrimaryColor(color)}
              >
                {primaryColor === color ? <CheckOutlined /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="app-settings-drawer__section">
          <div className="app-settings-drawer__label">{dictionary.settingPanel.navigationMode}</div>
          <div className="app-settings-drawer__option-row">
            {(['side', 'top', 'mix'] as const).map((mode) => (
              <button
                key={mode}
                className={`app-settings-preview${navigationMode === mode ? ' is-active' : ''}`}
                type="button"
                onClick={() => setNavigationMode(mode)}
              >
                <span className={`app-settings-preview__nav app-settings-preview__nav--${mode}`} />
                {navigationMode === mode ? <CheckOutlined className="app-settings-preview__check" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="app-settings-drawer__section">
          <div className="app-settings-drawer__label">{dictionary.settingPanel.sideMenuType}</div>
          <div className="app-settings-drawer__option-row">
            <button className={`app-settings-preview${darkPageStyle ? ' is-active' : ''}`} type="button">
              <span className="app-settings-preview__menu app-settings-preview__menu--dark" />
              {darkPageStyle ? <CheckOutlined className="app-settings-preview__check" /> : null}
            </button>
            <button className={`app-settings-preview${!darkPageStyle ? ' is-active' : ''}`} type="button">
              <span className="app-settings-preview__menu app-settings-preview__menu--light" />
              {!darkPageStyle ? <CheckOutlined className="app-settings-preview__check" /> : null}
            </button>
          </div>
        </div>

        <div className="app-settings-drawer__section app-settings-drawer__section--compact">
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.contentWidth}</span>
            <Select
              options={[
                { label: dictionary.settingPanel.fluid, value: 'fluid' },
                { label: dictionary.settingPanel.fixed, value: 'fixed' },
              ]}
              value={contentWidth}
              onChange={(value) => setContentWidth(value)}
            />
          </div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.fixedHeader}</span>
            <Switch checked={fixedHeader} onChange={setFixedHeader} />
          </div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.fixedSidebar}</span>
            <Switch checked={fixedSidebar} onChange={setFixedSidebar} />
          </div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.splitMenus}</span>
            <Switch checked={splitMenus} onChange={setSplitMenus} />
          </div>
        </div>

        <div className="app-settings-drawer__section app-settings-drawer__section--compact">
          <div className="app-settings-drawer__label">{dictionary.settingPanel.regionalSettings}</div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.header}</span>
            <Switch checked={showHeader} onChange={setShowHeader} />
          </div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.footer}</span>
            <Switch checked={showFooter} onChange={setShowFooter} />
          </div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.menu}</span>
            <Switch checked={showMenu} onChange={setShowMenu} />
          </div>
          <div className="app-settings-drawer__row">
            <span>{dictionary.settingPanel.menuHeader}</span>
            <Switch checked={showMenuHeader} disabled={!showMenu} onChange={setShowMenuHeader} />
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export function AppShell({
  children,
  dictionary,
  locale,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <ConfigProvider
      locale={antdLocaleMap[locale] ?? antdLocaleMap[defaultLocale]}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          colorBgBase: '#f5f5f5',
          fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <App>
        <AppProvider dictionary={dictionary} locale={locale}>
          <AppShellFrame>{children}</AppShellFrame>
        </AppProvider>
      </App>
    </ConfigProvider>
  );
}
