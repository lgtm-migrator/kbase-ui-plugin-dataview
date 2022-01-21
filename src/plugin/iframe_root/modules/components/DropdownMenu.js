define([
    'preact',
    'htm',
    './DropdownMenu.styles'
], (
    preact,
    htm,
    styles
) => {
    const {Component} = preact;
    const html = htm.bind(preact.h);

    class MenuItem extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isOpen: false,
                isHovered: false
            };
        }

        toggleSubMenu(event) {
            event.stopPropagation();
            this.setState({isOpen: !this.state.isOpen});
        }

        renderSubMenu() {
            const item = this.props.item;
            const [subMenu, menuClass] = (() => {
                if (this.state.isOpen) {
                    return [html`
                        <${DropdownMenu} menu=${item.menu}/>`, '-open'];
                }
                return [null, ''];
            })();
            const menuIconClass = (() => {
                if (this.state.isOpen) {
                    return 'fa fa-chevron-down';
                }
                return 'fa fa-chevron-right';
            })();
            let style = styles.item;
            if (this.state.isHovered) {
                style = {...style, ...styles.itemHover};
            }
            return html`
                <div className=${menuClass}
                     style=${style}
                     onMouseEnter=${this.hoverItemOn.bind(this)}
                     onMouseLeave=${this.hoverItemOff.bind(this)}
                     onClick=${this.toggleSubMenu.bind(this)}>
                    <div style=${styles.itemLabel}>
                        ${item.title}
                    </div>
                    <div className=${menuIconClass}
                         style=${styles.itemSubmenuIcon}
                    />
                    ${subMenu}
                </div>
            `;
        }

        renderDataMenu() {
            const item = this.props.item;
            const [subMenu, menuClass] = (() => {
                if (this.state.isOpen) {
                    const style = styles.item;
                    // if (this.state.isHovered) {
                    //     style = {...style, ...styles.itemHover};
                    // }
                    const items = item.dataMenu.items.map((item) => {
                        if (item.action) {
                            return html`
                                <div style=${style}
                                     onMouseEnter=${this.hoverItemOn.bind(this)}
                                     onMouseLeave=${this.hoverItemOff.bind(this)}
                                     onClick=${(event) => {
                    this.doAction(event, item.action);
                }}>
                                    <div style=${styles.itemLabel}>${item.title}</div>
                                </div>
                            `;
                        }
                        return html`
                            <div style=${item} onClick=${this.props.onActionCompleted}>
                                <div style=${styles.itemLabel}>${item.title}</div>
                            </div>
                        `;
                    });
                    return [html`
                        <div style=${styles.dataMenu}>${items}</div>`, '-open'];
                }
                return [null, ''];
            })();
            const menuIconClass = (() => {
                if (this.state.isOpen) {
                    return 'fa fa-chevron-down';
                }
                return 'fa fa-chevron-right';
            })();

            let itemStyle = styles.item;
            if (this.state.isHovered) {
                itemStyle = {...itemStyle, ...styles.itemHover};
            }
            // console.log('style??', itemLabelitemStyletyle, styles.itemLabel);

            return html`
                <div className=${menuClass}
                     style=${itemStyle}
                     onMouseEnter=${this.hoverItemOn.bind(this)}
                     onMouseLeave=${this.hoverItemOff.bind(this)}
                     onClick=${this.toggleSubMenu.bind(this)}>
                    <div style=${styles.itemLabel}>
                        ${item.title}
                    </div>
                    <div className=${menuIconClass} style=${styles.itemSubmenuIcon}/>
                        ${subMenu}
                    </div>
            `;
        }

        doAction(event, action) {
            event.stopPropagation();
            try {
                action();
            } catch (ex) {
                console.error('Error ', ex);
            }
            this.props.onActionCompleted();
        }

        render() {
            const item = this.props.item;
            let style = styles.item;
            if (this.state.isHovered) {
                style = {...style, ...styles.itemHover};
            }
            if (item.action) {
                return html`
                    <div style=${style}
                         onClick=${(event) => {
        this.doAction(event, item.action);
    }}
                         onMouseEnter=${this.hoverItemOn.bind(this)}
                         onMouseLeave=${this.hoverItemOff.bind(this)}>
                        <div style=${styles.itemLabel}>${item.title}</div>
                    </div>
                `;
            }
            if (item.menu) {
                return this.renderSubMenu(item);
            }
            if (item.dataMenu) {
                return this.renderDataMenu(item);
            }
            return html`
                <div style=${style} onMouseEnter=${this.hoverItemOn.bind(this)}
                     onMouseLeave=${this.hoverItemOff.bind(this)}>
                    <div style=${styles.itemLabel}>${item.title}</div>
                </div>
            `;
        }

        hoverItemOn(event) {
            // Object.entries(styles.itemHover).forEach(([name, value]) => {
            //     // console.log('item hover...', event.target.style.getPropertyValue('padding'), name, value);
            //     // event.target.style.setProperty(name, value);

            // });
            this.setState({
                isHovered: true
            });
        }

        hoverItemOff(event) {
            this.setState({
                isHovered: false
            });
            // Object.entries(styles.itemHover).forEach(([name, value]) => {
            //     // console.log('item off', name, value);
            //     // event.target.style.removeProperty(name);
            //     this.setState({
            //         isHovered: false
            //     });
            // });
        }
    }

    class DropdownMenu extends Component {
        constructor(props) {
            super(props);
            this.ref = preact.createRef();
            this.dropdownRef = preact.createRef();
            this.state = {
                open: false
            };
        }

        toggleMenu() {
            if (!this.ref.current) {
                return;
            }
            this.setState({
                open: !this.state.open
            });
        }

        doActionCompleted() {
            this.props.onClose();
        }

        renderMenu() {
            return this.props.menu.items.map((item) => {
                return html`
                    <${MenuItem} item=${item} onActionCompleted=${this.doActionCompleted.bind(this)}/>`;
            });
        }

        render() {
            return html`
                <div style=${styles.main} ref=${this.ref}>
                    <div style=${styles.dropdown} ref=${this.dropdownRef}>
                        <div style=${styles.wrapper}>
                            ${this.renderMenu()}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    return DropdownMenu;
});
