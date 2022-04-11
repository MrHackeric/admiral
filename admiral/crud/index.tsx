import { DataTable } from '../dataTable'
import { Form } from '../form'
import { Page, Button } from '../ui'
import { ColumnsType } from '../ui/Table/interfaces'
import { FiTrash, FiEdit3 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { CreateButton, BackButton } from '../actions'
import { TopToolbar } from '../layout'
import { useDataProvider } from '../dataProvider'
import React, { useCallback } from 'react'
import { useDataTable } from '../dataTable/DataTableContext'

const operationsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap',
}

export type CRUDConfig<RecordType> = {
    path: string
    actions?: React.ReactNode
    resource: string
    index: {
        title: string
        newButtonText: string
        tableOptions: ColumnsType<RecordType>
    }
    table?: { dndRows?: boolean }
    form: {
        create: {
            fields: React.ReactNode
        }
        edit: {
            fields: React.ReactNode
        }
    }
    create: {
        title: string
    }
    update: {
        title: (id: string) => string
    }
}

function makeIndexPage<RecordType extends { id: number | string } = any>(
    config: CRUDConfig<RecordType>,
) {
    return () => {
        const { deleteOne } = useDataProvider()
        const { dndRows } = config.table || {}
        return (
            <Page
                title={config.index.title}
                actions={
                    config.actions || (
                        <TopToolbar>
                            <CreateButton basePath={config.path}>
                                {config.index.newButtonText}
                            </CreateButton>
                        </TopToolbar>
                    )
                }
            >
                <DataTable
                    resource={config.resource}
                    columns={[
                        ...config.index.tableOptions,
                        {
                            title: 'Действия',
                            key: 'operation',
                            fixed: 'right',
                            width: 120,
                            render: (_value, record) => {
                                const { refresh } = useDataTable()
                                const handleDelete = useCallback(async () => {
                                    await deleteOne(config.resource, { id: record.id })
                                    refresh()
                                }, [])

                                return (
                                    <div style={operationsStyle}>
                                        <Link to={`${config.path}/${record.id}`}>
                                            <Button view="clear" size="S" iconRight={<FiEdit3 />} />
                                        </Link>

                                        <Button
                                            onClick={handleDelete}
                                            view="clear"
                                            size="S"
                                            iconRight={<FiTrash />}
                                        />
                                    </div>
                                )
                            },
                        },
                    ]}
                    dndRows={dndRows}
                />
            </Page>
        )
    }
}

function makeCreatePage<RecordType>(config: CRUDConfig<RecordType>) {
    return () => {
        const { getCreateFormData, create } = useDataProvider()

        const fetchInitialData = useCallback(() => {
            return getCreateFormData(config.resource)
        }, [])

        const submitData = useCallback((values) => {
            return create(config.resource, { data: values })
        }, [])

        return (
            <Page title={config.create.title}>
                <Form
                    submitData={submitData}
                    redirect={config.path}
                    fetchInitialData={fetchInitialData}
                >
                    <Form.Fields>{config.form.create.fields}</Form.Fields>

                    <Form.Footer>
                        <BackButton basePath={config.path}>Назад</BackButton>
                        <Form.Submit>Сохранить</Form.Submit>
                    </Form.Footer>
                </Form>
            </Page>
        )
    }
}

function makeUpdatePage<RecordType>(config: CRUDConfig<RecordType>) {
    return ({ id }: { id: string }) => {
        const { getUpdateFormData, update } = useDataProvider()

        const fetchInitialData = useCallback(() => {
            return getUpdateFormData(config.resource, { id })
        }, [])

        const submitData = useCallback((values) => {
            return update(config.resource, { data: values, id })
        }, [])

        return (
            <Page title={config.update.title(id)}>
                <Form
                    redirect={config.path}
                    submitData={submitData}
                    fetchInitialData={fetchInitialData}
                >
                    <Form.Fields>{config.form.edit.fields}</Form.Fields>

                    <Form.Footer>
                        <BackButton basePath={config.path}>Назад</BackButton>
                        <Form.Submit>Сохранить</Form.Submit>
                    </Form.Footer>
                </Form>
            </Page>
        )
    }
}

export function createCRUD<RecordType extends { id: number | string } = any>(
    config: CRUDConfig<RecordType>,
) {
    return {
        IndexPage: makeIndexPage<RecordType>(config),
        CreatePage: makeCreatePage<RecordType>(config),
        UpdatePage: makeUpdatePage<RecordType>(config),
    }
}
