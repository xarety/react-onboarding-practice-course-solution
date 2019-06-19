import * as React from 'react';
import { Button, Dropdown } from '@servicetitan/design-system';
import { formatNumber } from 'accounting';
import { Icon } from 'semantic-ui-react';

import * as Styles from './export.less';

interface ExportProps {
    className?: string;
    totalCount?: number;
    exportPdf?: () => void;
    exportExcel?: () => void;
}

export const Export: React.FC<ExportProps> = ({ className, totalCount, exportPdf, exportExcel }) => (
    <React.Fragment>
        <div className={className}>
            <Dropdown
                trigger={
                    <Button
                        className="qa-export-dropdown"
                        iconName="expand_more"
                        iconPosition="right"
                    >
                        <Icon name="download" />
                        <span>Download{!!totalCount && ` (${formatNumber(totalCount, 0)})`}</span>
                    </Button>
                }
                icon={null}
            >
                <Dropdown.Menu className={Styles.dropdown}>
                    {exportPdf && <Dropdown.Item className="qa-export-pdf" text=".PDF" onClick={exportPdf} />}
                    {exportExcel && <Dropdown.Item className="qa-export-excel" text=".XLSX" onClick={exportExcel} />}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    </React.Fragment>
);
