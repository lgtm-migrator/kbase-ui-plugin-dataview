define([
    'preact',
    'htm',
    'lib/formatters',
    'components/DataTable',
    './SampleSet.styles'
], (
    {Component, h},
    htm,
    fmt,
    DataTable,
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
        renderSamplesTable() {
            const columns = [{
                id: 'name',
                label: 'Name/ID',
                display: true,
                isSortable: true,
                style: {
                    flex: '2 0 0'
                },
                render: (name, sample) => {
                    return html`
                        <a href=${`/#samples/view/${sample.id}/${sample.version}`} target="_blank">${name}</a>
                    `;
                }
            }, {
                id: 'savedAt',
                label: 'Saved',
                display: true,
                isSortable: true,
                style: {
                    flex: '0 0 13em'
                },
                render: (savedAt) => {
                    return html`
                        <span>${fmt.formattedDate(savedAt)}</span>
                    `;
                }
            }, {
                id: 'savedBy',
                label: 'By',
                display: true,
                isSortable: true,
                style: {
                    flex: '0 0 13em'
                },
                render: (savedBy) => {
                    return html`
                        <a href=${`/#user/${savedBy}`}
                           target="_blank">${this.props.userProfiles[savedBy].user.realname}</a>
                    `;
                }
            }, {
                id: 'version',
                label: 'Version',
                display: true,
                isSortable: true,
                style: {
                    flex: '0 0 7em',
                    textAlign: 'right',
                    paddingRight: '1em'
                },
                render: (version) => {
                    return html`
                        <span>${version}</span>
                    `;
                }
            },
            ];

            const props = {
                columns,
                pageSize: 10,
                table: [],
                dataSource: this.props.samples.map((sample) => {
                    return {
                        id: sample.id,
                        name: sample.name,
                        material: getMetadataValue(sample, 'material', '-'),
                        sourceId: sample.node_tree[0].id,
                        savedAt: sample.save_date,
                        savedBy: sample.user,
                        version: sample.version,
                        // source: sample.sample.dataSourceDefinition.source
                    };
                })
            };

            const onRowClick = (row) => {
                window.open(`/#samples/view/${row.id}/${row.version}`, '_blank');
            };

            return html`
                <${DataTable} heights=${{row: 40, col: 40}} onClick=${onRowClick} ...${props}/>
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
            if (this.props.sampleSet.samples.length === 0) {
                return this.renderEmptySet();
            }
            return html`
                <div className="SampleSet" style=${styles.main}>
                    ${this.renderSamplesTable()}
                </div>
            `;
        }
    }

    return SampleSet;
});
