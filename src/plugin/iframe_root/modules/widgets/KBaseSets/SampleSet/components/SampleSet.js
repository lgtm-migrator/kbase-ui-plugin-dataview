define([
    'preact',
    'htm',
    'components/DataTable4',
    'components/Container',
    './SampleSet.styles'
], (
    {Component, h},
    htm,
    DataTable,
    Container,
    styles
) => {
    const html = htm.bind(h);

    function getMetadataValue(sample, name, defaultValue) {
        const metadata = sample.node_tree[0].meta_controlled;
        const userMetadata = sample.node_tree[0].meta_user;

        if (metadata[name]) {
            return metadata[name].value;
        }
        if (userMetadata[name]) {
            return userMetadata[name].value;
        }
        return defaultValue;
    }

    class SampleSet extends Component {
        constructor(props) {
            super(props);
            this.state = {
                view: 'normal'
            };
        }
        renderSamplesTable() {
            const columns = [{
                id: 'name',
                label: 'Sample Name',
                styles: {
                    column: {
                        flex: '2 0 0'
                    }
                },
                render: (name, sample) => {
                    return html`
                        <a href=${`/#samples/view/${sample.id}/${sample.version}`} 
                           title=${name}
                           target="_blank">${name}</a>
                    `;
                },
                sortable: true,
                searchable: true
            }, {
                id: 'description',
                label: 'Description',
                styles: {
                    column: {
                        flex: '2 0 0'
                    }},
                render: (description) => {
                    return html`<span title=${description}>${description}</span>`;
                },
                sortable: true,
                searchable: true
            }, {
                id: 'workspaceCount',
                label: '# Narratives',
                styles:{
                    column: {
                        flex: '0 0 10em',
                    },
                    data: {
                        textAlign: 'right',
                        paddingRight: '7em'
                    }
                },
                render: (workspaceCount) => {
                    return html`
                        <span>${Intl.NumberFormat('en-US', {useGrouping: true}).format(workspaceCount)}</span>
                    `;
                },
                sortable: true
            }, {
                id: 'linkCount',
                label: '# Links',
                styles:{
                    column: {
                        flex: '0 0 10em',
                    },
                    data: {
                        textAlign: 'right',
                        paddingRight: '7em'
                    }
                },
                render: (linkCount) => {
                    return html`
                        <span>${Intl.NumberFormat('en-US', {useGrouping: true}).format(linkCount)}</span>
                    `;
                },
                sortable: true
            }, {
                id: 'savedAt',
                label: 'Created',
                styles: {
                    column: {
                        flex: '0 0 6em'
                    }
                },
                // transform: (rawValue) => {
                //     try {
                //         return new Date(rawValue);
                //     } catch (ex) {
                //         console.error('Transform error!', rawValue, ex);
                //         return '** transform error **';
                //     }
                // },
                render: (savedAt) => {
                    const detailedTimestamp = Intl.DateTimeFormat('en-US', {
                        datestyle: 'full',
                        timeStype: 'long'
                    }).format(savedAt);
                    return html`
                        <span title=${detailedTimestamp}>${Intl.DateTimeFormat('en-US').format(savedAt)}</span>
                    `;
                },
                sortable: true
            }, {
                id: 'version',
                label: 'Version',
                styles: {
                    column: {
                        flex: '0 0 7em',
                    },
                    data: {
                        textAlign: 'right',
                        paddingRight: '5em'
                    }
                },
                render: (version) => {
                    return html`
                        <span>${version}</span>
                    `;
                },
                sortable: true
            }, {
                id: 'savedBy',
                label: 'By',
                styles: {
                    column: {
                        flex: '0 0 13em'
                    }
                },
                render: (savedBy) => {
                    return html`
                        <a href=${`/#user/${savedBy}`}
                           target="_blank"
                           title=${this.props.userProfiles[savedBy].user.realname}
                           >${this.props.userProfiles[savedBy].user.realname}</a>
                    `;
                }
            }];

            const props = {
                columns,
                dataSource: this.props.samplesWithCounts.map(({sample, workspaceCount, linkCount}) => {
                    return {
                        id: sample.id,
                        name: sample.name,
                        description: getMetadataValue(sample, 'description', '-'),
                        material: getMetadataValue(sample, 'material', '-'),
                        sourceId: sample.node_tree[0].id,
                        savedAt: sample.save_date,
                        savedBy: sample.user,
                        version: sample.version,
                        workspaceCount,
                        linkCount
                    };
                }),
                view: this.state.view,
                renderDetail: (row) => {
                    return html`
                        <${Container}>
                            ${this.props.sampleLinkedDataDetailController.view({id: row.id, version: row.version})}
                        </>
                    `;
                }
            };

            const onRowClick = (row) => {
                window.open(`/#samples/view/${row.id}/${row.version}`, '_blank');
            };

            return html`
                <${DataTable} flex=${true} bordered=${true} onClick=${onRowClick} ...${props}/>
            `;
        }

        renderEmptySet() {
            return html`
                <div class="alert alert-warning" style=${{marginTop: '10px'}}>
                    <span style=${{fontSize: '150%', marginRight: '4px'}}>∅</span> - Sorry, no samples in this set.
                </div>
            `;
        }

        render() {
            if (this.props.sampleSet.data.samples.length === 0) {
                return this.renderEmptySet();
            }
            //
            return html`
                <div className="SampleSet" style=${styles.main}>
                    ${this.renderSamplesTable()}
                </div>
            `;
        }
    }

    return SampleSet;
});
